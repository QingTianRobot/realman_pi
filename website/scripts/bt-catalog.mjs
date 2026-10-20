// Builds the behavior-tree data shown by BtTreeExplorer from the sources the executor itself uses, so the
// documentation cannot drift from the code:
//   - which XML tags exist: the registerNodeType<Class>("Tag") calls in realman_bt_executor_node.cpp
//   - each node's ports (kind, type, name, default, description): its C++ providedPorts()
//   - the production tree: config/behavior-trees/control.xml, with each element's preceding XML comment as its note
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return /\.(cpp|hpp|h)$/.test(entry.name) ? [path] : [];
    }),
  );
  return nested.flat();
}

// The text between the brace at `open` and its matching brace, skipping string and character literals.
function braceBody(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' || c === "'") {
      for (i += 1; i < text.length && text[i] !== c; i += 1) if (text[i] === "\\") i += 1;
    } else if (c === "{") {
      depth += 1;
    } else if (c === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(open + 1, i);
    }
  }
  throw new Error("unbalanced braces in providedPorts()");
}

// Splits a call's argument list at top-level commas. A string argument is the concatenation of its adjacent C++
// string literals ("a " "b" -> "a b"); anything else is kept as code.
function callArguments(text, open) {
  const args = [];
  let current = { strings: [], code: "" };
  let depth = 0;
  for (let i = open + 1; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"') {
      let value = "";
      for (i += 1; i < text.length && text[i] !== '"'; i += 1) {
        if (text[i] === "\\") {
          i += 1;
          value += { n: "\n", t: "\t" }[text[i]] ?? text[i];
        } else {
          value += text[i];
        }
      }
      current.strings.push(value);
    } else if (c === "(" || c === "<" || c === "{") {
      depth += 1;
      current.code += c;
    } else if ((c === ")" || c === ">" || c === "}") && depth > 0) {
      depth -= 1;
      current.code += c;
    } else if (c === ")" && depth === 0) {
      args.push(current);
      return args.map((arg) => (arg.strings.length ? arg.strings.join("") : arg.code.trim()));
    } else if (c === "," && depth === 0) {
      args.push(current);
      current = { strings: [], code: "" };
    } else {
      current.code += c;
    }
  }
  throw new Error("unterminated port declaration");
}

function portsIn(body) {
  const ports = [];
  for (const match of body.matchAll(/\b(Input|Output|Bidirectional)Port<([^()]*?)>\s*\(/g)) {
    const kind = match[1].toLowerCase();
    const args = callArguments(body, match.index + match[0].length - 1);
    // InputPort(name, default, description); OutputPort(name, description).
    const port = { kind, type: match[2].trim(), name: args[0] };
    if (kind === "output") {
      port.description = args[1] ?? "";
    } else {
      port.default = args[1] ?? "";
      port.description = args[2] ?? "";
    }
    ports.push(port);
  }
  return ports;
}

// Class name -> { ports, source } for every providedPorts() definition in `files`. A providedPorts() that starts
// from a shared helper (`auto ports = Base::commonPorts();`, any other `PortsList Class::name()` definition) gets
// that helper's ports first.
async function portDefinitions(files, repositoryDirectory) {
  const definitions = {};
  const helpers = {};
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/PortsList\s+(\w+)::(\w+)\(\)\s*\{/g)) {
      if (match[2] !== "providedPorts") {
        helpers[`${match[1]}::${match[2]}`] = portsIn(braceBody(text, match.index + match[0].length - 1));
      }
    }
  }
  const withHelpers = (body) => [
    ...[...body.matchAll(/\b(\w+::\w+)\(\)/g)].flatMap((call) => helpers[call[1]] ?? []),
    ...portsIn(body),
  ];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    const source = relative(repositoryDirectory, file);
    for (const match of text.matchAll(/(\w+)::providedPorts\(\)\s*\{/g)) {
      definitions[match[1]] = { ports: withHelpers(braceBody(text, match.index + match[0].length - 1)), source };
    }
    for (const match of text.matchAll(/static\s+(?:bt_core::)?PortsList\s+providedPorts\(\)\s*\{/g)) {
      const owner = [...text.slice(0, match.index).matchAll(/\b(?:class|struct)\s+(\w+)/g)].pop();
      if (!owner) continue;
      definitions[owner[1]] = { ports: portsIn(braceBody(text, match.index + match[0].length - 1)), source };
    }
  }
  return definitions;
}

function decodeEntities(text) {
  return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

// A small parser for the well-formed tree files: elements, attributes and comments. Each element keeps the comment
// written directly above it (or as its first child, the style control.xml uses inside a Sequence) as `note`.
export function parseTreeXml(xml) {
  const root = { tag: "#document", attrs: {}, children: [], note: null };
  const stack = [root];
  let pendingNote = null;
  const pattern = /<!--([\s\S]*?)-->|<\?[\s\S]*?\?>|<\/([\w:.-]+)\s*>|<([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  let match;
  while ((match = pattern.exec(xml)) !== null) {
    const [, comment, closing, tag, attributeText, selfClosing] = match;
    if (comment !== undefined) {
      const text = comment.replace(/\s+/g, " ").trim();
      pendingNote = pendingNote ? `${pendingNote} ${text}` : text;
    } else if (closing) {
      const top = stack.pop();
      if (top.tag !== closing) throw new Error(`control.xml: </${closing}> closes <${top.tag}>`);
      pendingNote = null;
    } else if (tag) {
      const attrs = {};
      for (const [, name, value] of attributeText.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) attrs[name] = decodeEntities(value);
      const node = { tag, attrs, children: [], note: pendingNote };
      pendingNote = null;
      stack[stack.length - 1].children.push(node);
      if (!selfClosing) stack.push(node);
    }
  }
  if (stack.length !== 1) throw new Error(`control.xml: <${stack[stack.length - 1].tag}> is never closed`);
  return root;
}

export async function buildBtCatalog(repositoryDirectory) {
  const executor = await readFile(
    join(repositoryDirectory, "src", "behavior", "realman_bt", "src", "realman_bt_executor_node.cpp"),
    "utf8",
  );
  const registered = [...executor.matchAll(/registerNodeType<\s*(?:[\w:]+::)?(\w+)\s*>\s*\(\s*"(\w+)"\s*\)/g)].map(
    ([, className, tag]) => ({ tag, className }),
  );
  if (registered.length === 0) throw new Error("no registerNodeType calls found in realman_bt_executor_node.cpp");

  const files = [
    ...(await sourceFiles(join(repositoryDirectory, "src", "behavior", "realman_bt", "src"))),
    ...(await sourceFiles(join(repositoryDirectory, "src", "behavior", "realman_bt", "include"))),
    ...(await sourceFiles(join(repositoryDirectory, "third_party", "behavior_tree_cpp", "bt_nodes"))),
    ...(await sourceFiles(join(repositoryDirectory, "third_party", "behavior_tree_cpp", "bt_core", "include"))),
  ];
  const definitions = await portDefinitions(files, repositoryDirectory);

  const nodes = Object.fromEntries(
    registered.map(({ tag, className }) => [
      tag,
      { className, ports: definitions[className]?.ports ?? [], source: definitions[className]?.source ?? null },
    ]),
  );

  const xml = await readFile(join(repositoryDirectory, "config", "behavior-trees", "control.xml"), "utf8");
  const document = parseTreeXml(xml);
  const rootElement = document.children.find((child) => child.tag === "root");
  if (!rootElement) throw new Error("control.xml has no <root>");
  const trees = rootElement.children
    .filter((child) => child.tag === "BehaviorTree")
    .map((tree) => ({ id: tree.attrs.ID, root: tree.children[0] }));

  // Every tag the tree uses must be registered, or the executor would refuse the file at load time.
  const unknown = new Set();
  const visit = (node) => {
    if (!nodes[node.tag]) unknown.add(node.tag);
    node.children.forEach(visit);
  };
  trees.forEach((tree) => visit(tree.root));
  if (unknown.size) throw new Error(`control.xml uses unregistered nodes: ${[...unknown].join(", ")}`);

  return { mainTree: rootElement.attrs.main_tree_to_execute, trees, nodes };
}
