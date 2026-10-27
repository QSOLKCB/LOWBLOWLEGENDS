# Browser CI and Pages

The `browser` job runs the existing Chromium, Firefox and WebKit checks inside
Microsoft's Playwright 1.51.1 Ubuntu Noble image. The image is pinned by version
and registry manifest digest; its version must match the Playwright dependency
in `package.json` and `package-lock.json`. `npm ci --ignore-scripts` still installs
the locked test package. The browsers and system libraries come from the image,
so CI does not run `playwright install --with-deps` on each invocation.
The container runs as UID 1001, matching the hosted runner's workspace/home
ownership. Running as root with GitHub's user-owned home prevents Firefox from
starting; no home-variable override or browser-test exemption is used.

The Chromium keyboard harness freezes Playwright's clock before starting a
match, then advances simulation only through `clock.runFor`. Installing the
clock alone leaves it advancing between driver commands, so a slow runner can
consume a short attack before its state assertion. A wall-time delay now checks
that the test clock stays frozen; all existing combat assertions are retained.

The container is test infrastructure only. It adds no production assets,
packages, network requests or runtime bytes. It exercises the local staged site,
not arbitrary external websites. See the upstream [Docker guidance](https://playwright.dev/docs/docker)
and [GitHub Actions example](https://playwright.dev/docs/ci#via-containers).

The full job allows 15 minutes for image download, setup and tests. The actual
build/browser step has a separate five-minute bound. No browser, assertion or
Pages dependency is disabled: Pages still requires both `verify` and `browser`
to pass for the pushed main commit. PR checks use the exact PR head and do not
deploy. Maintainers merge reviewed changes and control main deployment.

## Incident motivating this change

After PR #2 merged, [run 40444968737](https://github.com/QSOLKCB/LOWBLOWLEGENDS/actions/runs/40444968737)
timed out twice while downloading Ubuntu packages from `azure.archive.ubuntu.com`.
The second attempt needed 119 MB of archives and reached only package 44 when
the ten-minute job limit cancelled it. The browser test command never started;
the dependent Pages job was skipped, leaving the old teaser live. Repeatedly
retrying the same dependency installation did not resolve the blocker.

This change removes that per-run apt download. Image-registry or npm outages can
still fail CI. The PR records actual final-head CI/review results; merging alone
is not proof of deployment. After the main run succeeds, check the public URL
for the playable selection screen and complete a hosted start/pause/result smoke
test before claiming the game is live.
