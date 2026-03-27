# Comment Discovery

We do some basic searches to find relevant TSDoc comment strings in the source code,
before sending them to the @microsoft/tsdoc package for parsing.

Declarations can have comments associated with them, which for:
 - Variable Statement, we check the space inbetween the previous