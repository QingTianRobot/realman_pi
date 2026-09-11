# 第三方依赖

## tinyxml2

- **来源**: https://github.com/leethomason/tinyxml2
- **版本**: 10.0.0
- **许可证**: zlib License(宽松，允许商用与修改）
- **用途**: `bt_core` 的 XML 序列化（XmlParser）解析/生成行为树定义文件。
- **引入方式**: vendored（直接纳入源码 `tinyxml2.h` + `tinyxml2.cpp`），避免构建时联网。

仅含两文件，由 `bt_core/CMakeLists.txt` 直接编译进核心库。
