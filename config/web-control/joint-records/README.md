# Web Control Joint Records

The browser Web control service stores confirmed joint target records here.
Each arm owns its own directory:

- `l/` for the left arm
- `m/` for the middle arm
- `r/` for the right arm

Record files use `realman_joint_record.v1` YAML and store six joint angles in
degrees. The Web UI writes one file per saved target; selecting a record only
fills the current motion form and preview, it does not submit motion by itself.
