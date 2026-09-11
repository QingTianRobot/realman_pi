# Commercial Release Checklist

This checklist separates engineering readiness from legal authority to distribute the project.

## Engineering Gates

- [x] `./scripts/test.sh` covers Release CTest, ASan/UBSan plugin lifetime, installed SDK consumption, server API integration, frontend unit/build, mocked/live Playwright, temporary screenshot hashes, and Sphinx HTML/linkcheck.
- [x] ROS2 Humble mock, build, launch, service, and one-event DDS evidence exists.
- [x] Jazzy is disclosed exactly as: **unverified: ROS 2 Jazzy is not installed on this machine.**
- [x] The 25-node catalog, strict XML migration rules, and eight-node `RechargeTask` tutorial match current code.
- [x] `THIRD_PARTY_NOTICES.md` inventories vendored C++, direct frontend, and documentation dependencies.

## Owner And Legal Gates

- [ ] The product owner approves the project license and commits the complete root `LICENSE` text.
- [ ] The product owner supplies the legal copyright holder and real maintainer name/email.
- [ ] `bt_ros2/package.xml` placeholder maintainer metadata is replaced and its license identifier is confirmed against the root license.
- [ ] Legal/product review confirms the complete third-party notice bundle for each source and binary distribution format.
- [ ] Release artifacts include the approved root license and required third-party license texts/notices.
- [ ] The release version, support policy, vulnerability-reporting contact, and signing/publishing authority are approved.

## Boundary

Engineering can make the repository release-ready, but project licensing is a legal/product-owner decision. The package currently claims Apache-2.0 without a root license file. A commercial-release claim remains conditional on the owner supplying the approved root license and maintainer identity.

Until every Owner And Legal Gate is closed, describe the repository as **engineering release-ready** only. Do not claim that it is legally approved for public or commercial distribution.
