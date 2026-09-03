/** Host anchor for the browser-only image-result presentation plugin. */
export const name = 'dsh-ui-tool-result-images'

/** No Host services are required; the package row exposes its Client declaration. */
export const inject: readonly string[] = []

/** Keep the Host row alive so Web discovers this package's `dsh.client` face. */
export function apply(): void {}
