# EDU-1C — Editing Academy initial public release

Date: 2026-10-11. Scope: the existing EDU-1A + EDU-1B-01 implementation at `/ex-ai/editing/` only. This is a child-route public release, not a parent-site redesign or course/media launch.

## Verified publishing ownership

- Public site: `https://excreatorstudio.com/`; HTTPS requests identify GitHub.com. The apex resolves to GitHub Pages addresses. Cloudflare is the DNS authority, not the static application host in this publishing path.
- Deployment repository: `https://github.com/excreatorstudio/excreatorstudio.github.io`, default branch `main`, Pages enabled; local remote `exstudio`.
- Existing workflow: `.github/workflows/deploy.yml`, push to `main` → checkout with Git LFS → Node 22 / `npm ci` → `npm run build` → upload `out` → `actions/deploy-pages`.
- Next.js 15.5.22 static export, trailing-slash routing, unoptimized local images. The existing `.github.io` repository name selects the root base path. No build, workflow, domain, DNS or hosting settings changed.
- Before release, both `exstudio/main` and `origin/main` resolve to `7880d9da12e84583348b3a9e49809298d2cee530`. Only the verified hosting remote `exstudio/main` needs to be updated for this release; the separate `origin` mirror is not a publishing prerequisite and is left untouched.
- Previous successful public release: commit `7880d9da12e84583348b3a9e49809298d2cee530`; Actions run `34675595855`; Pages deployment `6406320299`, success. Six critical public routes returned 200 before release.

## Source isolation

An isolated worktree, `codex/edu-1c-editing-public-release`, starts directly from the currently published commit above. It does not start from the older, dirty development branch. Only the following twelve additive paths are approved for the release commit:

```text
docs/editing-academy/edu-1a-asset-manifest.md
docs/editing-academy/edu-1c-initial-public-release.md
public/images/editing-academy/studio-1600.webp
public/images/editing-academy/studio-800.webp
scripts/editing-academy-assets.mjs
scripts/editing-academy-preview.mjs
src/app/ex-ai/editing/page.tsx
src/components/editing-academy/EditingAcademy.tsx
src/components/editing-academy/editing-academy.module.css
src/data/editing-academy.ts
tests/editing-academy-browser.test.mjs
tests/editing-academy.test.mjs
```

No shared application source, existing route, package manifest/lockfile, existing public asset or deployment configuration changes are included. The asset conversion helper and local browser-server helper support the focused tests and media governance; neither runs in the public application.

Excluded: the entire unrelated dirty development delta; `_pm_vnext_merge/`; incomplete Training Manager fragments; `PropertyMediaOrbit.tsx` work; `PROGRESS.md` / `TASKS.md` work if present; unapproved candidate media; development screenshots, local reports, backups and generated output. The older working-file validation materializer and historical EDU-1A implementation report are not release dependencies and are not copied. Screenshots and temporary audit tools remain in ignored `.npm-cache/edu-1c-evidence/` / `.npm-cache/`, outside `public` and outside the commit.

The original worktree's HEAD, branch, Git status and SHA-256 values of all five pre-existing modified tracked files are recorded before release and compared again after publishing. The eleven copied implementation/test/support files also have source-parity hashes.

## Content and media state

- Hero, learning steps, free lessons, paid-course descriptions, conceptual portfolio, coaching descriptions, FAQ and footer are included.
- Four steps are selectable by pointer and keyboard. They update instruction/visual focus only; no editing operation or video timestamp is simulated.
- `videoStatus = PENDING`, `videoSrc = null`, `posterSrc = null`. The public teaching surface displays `教學影片準備中` / `VIDEO_PENDING`; there is no active player, iframe or submission form.
- All six courses remain `COMING_SOON`. Inquiry remains `PENDING`, without booking, payment, contact-data collection or fabricated success. Portfolio artwork is explicitly illustrative, not student work.
- Two responsive local WebPs, both `MOCK_ONLY`: 1600×900 / 63,156 bytes and 800×450 / 25,946 bytes. No new video, screenshot, external media, API, database, authentication or payment integration.
- Missing content: actual tutorial video, approved editing screenshots, approved portfolio examples; approved course schedules/prices and inquiry destination also remain pending.

## Fresh pre-deployment validation

All checks below use the isolated release source and its unchanged lockfile, not the dirty development tree:

| Gate | Result |
| --- | --- |
| Dependencies | `npm ci` succeeds; package manifests/lockfile unchanged |
| Typecheck | PASS |
| Lint | PASS |
| Static build | PASS — framework generates 42/42; prior public baseline had 41, with only `/ex-ai/editing/` added; 41 exported HTML files include the 404 document |
| Academy focused tests | 10 PASS |
| Canonical existing regression | 189 PASS / 1 existing skip / 0 FAIL |
| Property Media / Universe supplemental regression | 78 PASS |
| Academy browser suite | 17 PASS |
| Additional preflight | Six existing critical routes retain title, headings and navigation; Academy passes 1440/1024/768/430/390/320, both themes, all four steps, keyboard, six course dialogs and reload |
| Fallback / accessibility | Missing-Hero fallback, reserved layout, reduced motion, FAQ, modal focus return, theme persistence/system and meaningful controls verified by browser suite |
| Static output | No environment files, databases, backups, source maps, source files or test/evidence folders; required route HTML, JS/CSS and two Hero images present |
| Secret-pattern review | No matching credential/private-key/provider-key patterns in selected text files or public build output; no environment files imported into this release snapshot |

Existing non-blocking observations: Next emits the nested-lockfile workspace-root inference warning; no configuration change is needed. The existing `/ex-ai/` page prefetches absent `/ex-galaxy-ui/index.txt`, yielding one 404 console/network message both before release and in the isolated source. The existing visible EX AI route still works. This inherited unrelated issue is not modified or relabeled as a clean console.

The verified GitHub Pages responses currently have no explicit CSP/HSTS/nosniff policy, and an HTTP request to the existing EX AI page is served without mandatory HTTPS redirection. Those inherited hosting policies are preserved, not weakened or newly certified. The release and QA use valid HTTPS. Security-policy hardening is outside this child-route publishing scope.

## Explicit staging and publishing

After the pre-deployment gates and current remote-parent check pass, stage only the twelve listed paths. Review `git diff --cached --name-status`, `git diff --cached --check` and staged secret patterns before committing. The commit is an additive child of the current live baseline.

```powershell
git add -- docs/editing-academy/edu-1a-asset-manifest.md docs/editing-academy/edu-1c-initial-public-release.md public/images/editing-academy/studio-1600.webp public/images/editing-academy/studio-800.webp scripts/editing-academy-assets.mjs scripts/editing-academy-preview.mjs src/app/ex-ai/editing/page.tsx src/components/editing-academy/EditingAcademy.tsx src/components/editing-academy/editing-academy.module.css src/data/editing-academy.ts tests/editing-academy-browser.test.mjs tests/editing-academy.test.mjs
git diff --cached --check
git commit -m "feat: publish Editing Academy learning steps"
git push exstudio HEAD:refs/heads/main
```

No force push, tags, merge of development work, mirror push, DNS change or new hosting project. A successful push is not deployment acceptance: wait for the new existing Pages workflow to succeed, then verify actual HTTPS routes/assets/browser behavior. This document records the pre-deployment gate; final commit/run/deployment identifiers and live QA belong in the local post-release report, not invented here.

## Rollback readiness

Recovery reference: previous public commit `7880d9da12e84583348b3a9e49809298d2cee530`, workflow `34675595855`, deployment `6406320299`.

If the new public release regresses, stop further changes. In the isolated release worktree, first confirm the remote is still the new release commit; if concurrent changes exist, stop rather than overwrite them. Revert only the EDU-1C release commit using `git revert --no-edit <EDU_1C_COMMIT>`. Verify the resulting tracked tree equals the previous baseline, run the existing build, and push that normal fast-forward rollback commit to `exstudio/main`. The unchanged Pages workflow republishes the previous source. Wait for success and recheck the critical routes. Never force-reset the remote or alter DNS. The current dirty development worktree is not involved.

No rollback is executed as a test against the working public site. Prior immutable source and the existing publishing path are the recovery mechanism.

## Stop boundary

After successful live verification, stop. Next suggested work is **EDU-1D — Real Tutorial Media Integration**, only with separate authorization and approved media. Physical iPhone/Safari, screen-reader and full WCAG certification are not claimed by this desktop Chromium release QA.
