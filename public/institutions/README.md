# Institution logos (optional)

GastosWise shows a colored initials badge for each bank / e-wallet by
default (see `src/lib/institutions.ts`). Bank and e-wallet logos are
trademarks, so none are bundled.

If you have permission to use an official logo:

1. Put the file here, e.g. `public/institutions/gcash.svg` (square SVG or
   PNG works best, at least 128×128).
2. In `src/lib/institutions.ts`, add `logo: "/institutions/gcash.svg"` to
   that institution's entry.

It will then appear everywhere that account is shown — account cards,
transaction lists, pickers and the dashboard.
