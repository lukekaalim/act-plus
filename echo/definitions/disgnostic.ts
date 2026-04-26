/**
 * Alongside echo parsing, the typescript library
 * might produce a variety of warning and errors.
 * 
 * This object captures a single diagnostic, which
 * will normally be available on the echo object. 
 */
export type Diagnostic = {
  message: string,
  category: string,
  source: string,
}


/**
 * This is meant to mirror the DiagnosticMessage
 * data structure that Typescript provides in it's API
 */
export type DiagnosticFragment = {

}