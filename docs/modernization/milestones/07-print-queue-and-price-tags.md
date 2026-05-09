# Milestone 7: Print Queue And Price Tags

## Objective

Rebuild the print queue and physical price-tag output with parity to the current app.

## Prerequisites

- Milestone 6 catalog workflow works.
- Print Queue domain logic is tested.
- Current print output reference exists, such as `example.pdf` or browser print screenshots.

## Tasks

1. Rebuild print queue.
   - Add item with quantity.
   - Increment existing item quantity.
   - Remove item from queue.
   - Clear queue.
   - Persist queue in localStorage.
   - Recover gracefully from invalid localStorage.

2. Rebuild price tag rendering.
   - Render hidden or dedicated print sheet.
   - Preserve two half-tags per item behavior.
   - Preserve discount display behavior.
   - Preserve brand/model formatting as closely as practical.
   - Keep A4 page size and print CSS.

3. Add print-specific CSS.
   - Hide app chrome in print media.
   - Render only price tags for printing.
   - Keep dimensions stable.
   - Avoid layout shifts caused by dynamic content.

4. Add tests.
   - Print Queue unit tests already pass.
   - Component tests for queue rendering.
   - Component tests for tag rendering with discount on/off.
   - Playwright smoke test for print view rendering.

5. Manual print validation.
   - Compare output to `example.pdf`.
   - Print or preview a small sample.
   - Adjust only to restore parity, not redesign.

## Verification

- Adding items creates correct number of printable tags.
- Discount on/off states render correctly.
- Print preview shows only price tags.
- Playwright print smoke test passes.

## Rollback

- Keep print work isolated to modern app until cutover.

## Risks

- Browser print behavior can differ across Chrome/Safari.
- Small CSS changes can affect physical printed dimensions.

## Done Criteria

- Print queue and tag output match the old app closely enough for real use.
