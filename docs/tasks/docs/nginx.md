---
id: docs-3
status: backlog
---
### Nginx Server Config

We kinda just tossed the bundle onto the nginx subpath.
This breaks:
  - [ ] Navigating/Linking to any page other than home

because of SPA stuff. We should:
  - [ ] Add pregeneration so we have all the HTML pages
  - [ ] Configure Nginx to do SPA stuff on the act & act.plus directories