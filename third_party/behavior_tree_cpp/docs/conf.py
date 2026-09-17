"""Sphinx configuration for BehaviorTree.CPP-X."""

from __future__ import annotations

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

project = "BehaviorTree.CPP-X"
author = "BehaviorTree.CPP-X contributors"
release = "0.1.0"
version = release

language = "zh_CN"
master_doc = "index"
source_suffix = ".rst"
extensions: list[str] = []
templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

html_theme = "alabaster"
html_static_path = ["_static"]
html_css_files = ["btx.css"]
html_title = "BehaviorTree.CPP-X 文档"
html_show_sourcelink = False

rst_prolog = f"""
.. |repo_root| replace:: {PROJECT_ROOT}
"""
