# Gemini CLI 变更日志

Gemini
CLI 有三个主要的发布渠道：nightly、preview 和 stable。对于大多数用户，我们推荐使用稳定版。

在此页面上，您可以找到有关当前发布的信息以及每个发布的亮点。

有关完整的变更日志（包括 nightly 发布），请参阅 GitHub 上的
[Releases - google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli/releases)。

## 当前发布

| 发布渠道                       | 说明                             |
| :----------------------------- | :------------------------------- |
| Nightly                        | 包含最新更改的每夜发布。         |
| [Preview (预览版)](preview.md) | 准备好接受早期反馈的实验性功能。 |
| [Latest (最新版)](latest.md)   | 稳定，推荐一般使用。             |

## Release v0.24.0-preview (Preview)

### 亮点

- 🎉 **预览版支持实验性 Agent 技能:** Gemini CLI 现在我们的预览版构建中支持
  [Agent Skills](https://agentskills.io/home)。这是一个早期预览，我们要征求反馈！
  - 安装预览版: `npm install -g @google/gemini-cli@preview`
  - 在 `/settings` 中启用
  - 文档:
    [https://geminicli.com/docs/cli/skills/](https://geminicli.com/docs/cli/skills/)

### 变更内容

- chore(core): refactor model resolution and cleanup fallback logic by
  @adamfweidman in https://github.com/google-gemini/gemini-cli/pull/15228
- Add Folder Trust Support To Hooks by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15325
- Record timestamp with code assist metrics. by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15439
- feat(policy): implement dynamic mode-aware policy evaluation by @abhipatel12
  in https://github.com/google-gemini/gemini-cli/pull/15307
- fix(core): use debugLogger.debug for startup profiler logs by @NTaylorMullen
  in https://github.com/google-gemini/gemini-cli/pull/15443
- feat(ui): Add security warning and improve layout for Hooks list by
  @SandyTao520 in https://github.com/google-gemini/gemini-cli/pull/15440
- fix #15369, prevent crash on unhandled EIO error in readStdin cleanup by
  @ElecTwix in https://github.com/google-gemini/gemini-cli/pull/15410
- chore: improve error messages for --resume by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/15360
- chore: remove clipboard file by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/15447
- Implemented unified secrets sanitization and env. redaction options by
  @gundermanc in https://github.com/google-gemini/gemini-cli/pull/15348
- feat: automatic `/model` persistence across Gemini CLI sessions by @niyasrad
  in https://github.com/google-gemini/gemini-cli/pull/13199
- refactor(core): remove deprecated permission aliases from BeforeToolHookOutput
  by @StoyanD in https://github.com/google-gemini/gemini-cli/pull/14855
- fix: add missing `type` field to MCPServerConfig by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/15465
- Make schema validation errors non-fatal by @jacob314 in
  https://github.com/google-gemini/gemini-cli/pull/15487
- chore: limit MCP resources display to 10 by default by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/15489
- Add experimental in-CLI extension install and uninstall subcommands by
  @chrstnb in https://github.com/google-gemini/gemini-cli/pull/15178
- feat: Add A2A Client Manager and tests by @adamfweidman in
  https://github.com/google-gemini/gemini-cli/pull/15485
- feat: terse transformations of image paths in text buffer by @psinha40898 in
  https://github.com/google-gemini/gemini-cli/pull/4924
- Security: Project-level hook warnings by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15470
- Added modifyOtherKeys protocol support for tmux by @ved015 in
  https://github.com/google-gemini/gemini-cli/pull/15524
- chore(core): fix comment typo by @Mapleeeeeeeeeee in
  https://github.com/google-gemini/gemini-cli/pull/15558
- feat: Show snowfall animation for holiday theme by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15494
- do not persist the fallback model by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15483
- Resolve unhandled promise rejection in ide-client.ts by @Adib234 in
  https://github.com/google-gemini/gemini-cli/pull/15587
- fix(core): handle checkIsRepo failure in GitService.initialize by
  @Mapleeeeeeeeeee in https://github.com/google-gemini/gemini-cli/pull/15574
- fix(cli): add enableShellOutputEfficiency to settings schema by
  @Mapleeeeeeeeeee in https://github.com/google-gemini/gemini-cli/pull/15560
- Manual nightly version bump to 0.24.0-nightly.20251226.546baf993 by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/15594
- refactor(core): extract static concerns from CoreToolScheduler by @abhipatel12
  in https://github.com/google-gemini/gemini-cli/pull/15589
- fix(core): enable granular shell command allowlisting in policy engine by
  @abhipatel12 in https://github.com/google-gemini/gemini-cli/pull/15601
- chore/release: bump version to 0.24.0-nightly.20251227.37be16243 by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15612
- refactor: deprecate legacy confirmation settings and enforce Policy Engine by
  @abhipatel12 in https://github.com/google-gemini/gemini-cli/pull/15626
- Migrate console to coreEvents.emitFeedback or debugLogger by @Adib234 in
  https://github.com/google-gemini/gemini-cli/pull/15219
- Exponential back-off retries for retryable error without a specified … by
  @sehoon38 in https://github.com/google-gemini/gemini-cli/pull/15684
- feat(agents): add support for remote agents and multi-agent TOML files by
  @adamfweidman in https://github.com/google-gemini/gemini-cli/pull/15437
- Update wittyPhrases.ts by @segyges in
  https://github.com/google-gemini/gemini-cli/pull/15697
- refactor(auth): Refactor non-interactive mode auth validation & refresh by
  @skeshive in https://github.com/google-gemini/gemini-cli/pull/15679
- Revert "Update wittyPhrases.ts (#15697)" by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15719
- fix(hooks): deduplicate agent hooks and add cross-platform integration tests
  by @abhipatel12 in https://github.com/google-gemini/gemini-cli/pull/15701
- Implement support for tool input modification by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15492
- Add instructions to the extensions update info notification by @chrstnb in
  https://github.com/google-gemini/gemini-cli/pull/14907
- Add extension settings info to /extensions list by @chrstnb in
  https://github.com/google-gemini/gemini-cli/pull/14905
- Agent Skills: Implement Core Skill Infrastructure & Tiered Discovery by
  @NTaylorMullen in https://github.com/google-gemini/gemini-cli/pull/15698
- chore: remove cot style comments by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15735
- feat(agents): Add remote agents to agent registry by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15711
- feat(hooks): implement STOP_EXECUTION and enhance hook decision handling by
  @SandyTao520 in https://github.com/google-gemini/gemini-cli/pull/15685
- Fix build issues caused by year-specific linter rule by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15780
- fix(core): handle unhandled promise rejection in mcp-client-manager by
  @kamja44 in https://github.com/google-gemini/gemini-cli/pull/14701
- log fallback mode by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15817
- Agent Skills: Implement Autonomous Activation Tool & Context Injection by
  @NTaylorMullen in https://github.com/google-gemini/gemini-cli/pull/15725
- fix(core): improve shell command with redirection detection by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/15683
- Add security docs by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15739
- feat: add folder suggestions to `/dir add` command by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/15724
- Agent Skills: Implement Agent Integration and System Prompt Awareness by
  @NTaylorMullen in https://github.com/google-gemini/gemini-cli/pull/15728
- chore: cleanup old smart edit settings by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15832
- Agent Skills: Status Bar Integration for Skill Counts by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15741
- fix(core): mock powershell output in shell-utils test by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/15831
- Agent Skills: Unify Representation & Centralize Loading by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15833
- Unify shell security policy and remove legacy logic by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15770
- feat(core): restore MessageBus optionality for soft migration (Phase 1) by
  @abhipatel12 in https://github.com/google-gemini/gemini-cli/pull/15774
- feat(core): Standardize Tool and Agent Invocation constructors (Phase 2) by
  @abhipatel12 in https://github.com/google-gemini/gemini-cli/pull/15775
- feat(core,cli): enforce mandatory MessageBus injection (Phase 3 Hard
  Migration) by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15776
- Agent Skills: Extension Support & Security Disclosure by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15834
- feat(hooks): implement granular stop and block behavior for agent hooks by
  @SandyTao520 in https://github.com/google-gemini/gemini-cli/pull/15824
- Agent Skills: Add gemini skills CLI management command by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15837
- refactor: consolidate EditTool and SmartEditTool by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15857
- fix(cli): mock fs.readdir in consent tests for Windows compatibility by
  @NTaylorMullen in https://github.com/google-gemini/gemini-cli/pull/15904
- refactor(core): Extract and integrate ToolExecutor by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15900
- Fix terminal hang when user exits browser without logging in by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15748
- fix: avoid SDK warning by not accessing .text getter in logging by @ved015 in
  https://github.com/google-gemini/gemini-cli/pull/15706
- Make default settings apply by @devr0306 in
  https://github.com/google-gemini/gemini-cli/pull/15354
- chore: rename smart-edit to edit by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15923
- Opt-in to persist model from /model by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15820
- fix: prevent /copy crash on Windows by skipping /dev/tty by @ManojINaik in
  https://github.com/google-gemini/gemini-cli/pull/15657
- Support context injection via SessionStart hook. by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15746
- Fix order of preflight by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15941
- Fix failing unit tests by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15940
- fix(cli): resolve paste issue on Windows terminals. by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15932
- Agent Skills: Implement /skills reload by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15865
- Add setting to support OSC 52 paste by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15336
- remove manual string when displaying manual model in the footer by @sehoon38
  in https://github.com/google-gemini/gemini-cli/pull/15967
- fix(core): use correct interactive check for system prompt by @ppergame in
  https://github.com/google-gemini/gemini-cli/pull/15020
- Inform user of missing settings on extensions update by @chrstnb in
  https://github.com/google-gemini/gemini-cli/pull/15944
- feat(policy): allow 'modes' in user and admin policies by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15977
- fix: default folder trust to untrusted for enhanced security by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/15943
- Add description for each settings item in /settings by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15936
- Use GetOperation to poll for OnboardUser completion by @ishaanxgupta in
  https://github.com/google-gemini/gemini-cli/pull/15827
- Agent Skills: Add skill directory to WorkspaceContext upon activation by
  @NTaylorMullen in https://github.com/google-gemini/gemini-cli/pull/15870
- Fix settings command fallback by @chrstnb in
  https://github.com/google-gemini/gemini-cli/pull/15926
- fix: writeTodo construction by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/16014
- properly disable keyboard modes on exit by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/16006
- Add workflow to label child issues for rollup by @bdmorgan in
  https://github.com/google-gemini/gemini-cli/pull/16002
- feat(ui): add visual indicators for hook execution by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15408
- fix: image token estimation by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/16004
- feat(hooks): Add a hooks.enabled setting. by @joshualitt in
  https://github.com/google-gemini/gemini-cli/pull/15933
- feat(admin): Introduce remote admin settings & implement
  secureModeEnabled/mcpEnabled by @skeshive in
  https://github.com/google-gemini/gemini-cli/pull/15935
- Remove trailing whitespace in yaml. by @joshualitt in
  https://github.com/google-gemini/gemini-cli/pull/16036
- feat(agents): add support for remote agents by @adamfweidman in
  https://github.com/google-gemini/gemini-cli/pull/16013
- fix: limit scheduled issue triage queries to prevent argument list too long
  error by @jerop in https://github.com/google-gemini/gemini-cli/pull/16021
- ci(github-actions): triage all new issues automatically by @jerop in
  https://github.com/google-gemini/gemini-cli/pull/16018
- Fix test. by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/16011
- fix: hide broken skills object from settings dialog by @korade-krushna in
  https://github.com/google-gemini/gemini-cli/pull/15766
- Agent Skills: Initial Documentation & Tutorial by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15869

**完整变更日志**:
https://github.com/google-gemini/gemini-cli/compare/v0.23.0-preview.6...v0.24.0-preview.0

## Release v0.23.0 (Latest)

### 亮点

- **Gemini CLI wrapped:** 运行 `npx gemini-wrapped`
  来可视化您的使用统计、顶级模型、语言等！
- **Windows 剪贴板图像支持:** Windows 用户现在可以使用 `Alt`+`V`
  直接将剪贴板中的图像粘贴到 CLI 中。([pr](https://github.com/google-gemini/gemini-cli/pull/13997)
  by [@sgeraldes](https://github.com/sgeraldes))
- **终端背景颜色检测:**
  自动优化终端的背景颜色以选择兼容的主题并提供可访问性警告。([pr](https://github.com/google-gemini/gemini-cli/pull/15132)
  by [@jacob314](https://github.com/jacob314))
- **会话注销:** 使用新的 `/logout`
  命令即时清除凭据并重置您的身份验证状态，以便无缝切换帐户。([pr](https://github.com/google-gemini/gemini-cli/pull/13383)
  by [@CN-Scars](https://github.com/CN-Scars))

### 变更内容

- Code assist service metrics. by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15024
- chore/release: bump version to 0.21.0-nightly.20251216.bb0c0d8ee by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15121
- Docs by @Roaimkhan in https://github.com/google-gemini/gemini-cli/pull/15103
- Use official ACP SDK and support HTTP/SSE based MCP servers by @SteffenDE in
  https://github.com/google-gemini/gemini-cli/pull/13856
- Remove foreground for themes other than shades of purple and holiday. by
  @jacob314 in https://github.com/google-gemini/gemini-cli/pull/14606
- chore: remove repo specific tips by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/15164
- chore: remove user query from footer in debug mode by @jackwotherspoon in
  https://github.com/google-gemini/gemini-cli/pull/15169
- Disallow unnecessary awaits. by @gundermanc in
  https://github.com/google-gemini/gemini-cli/pull/15172
- Add one to the padding in settings dialog to avoid flicker. by @jacob314 in
  https://github.com/google-gemini/gemini-cli/pull/15173
- feat(core): introduce remote agent infrastructure and rename local executor by
  @adamfweidman in https://github.com/google-gemini/gemini-cli/pull/15110
- feat(cli): Add `/auth logout` command to clear credentials and auth state by
  @CN-Scars in https://github.com/google-gemini/gemini-cli/pull/13383
- (fix) Automated pr labeller by @DaanVersavel in
  https://github.com/google-gemini/gemini-cli/pull/14885
- feat: launch Gemini 3 Flash in Gemini CLI ⚡️⚡️⚡️ by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15196
- Refactor: Migrate console.error in ripGrep.ts to debugLogger by @Adib234 in
  https://github.com/google-gemini/gemini-cli/pull/15201
- chore: update a2a-js to 0.3.7 by @adamfweidman in
  https://github.com/google-gemini/gemini-cli/pull/15197
- chore(core): remove redundant isModelAvailabilityServiceEnabled toggle and
  clean up dead code by @adamfweidman in
  https://github.com/google-gemini/gemini-cli/pull/15207
- feat(core): Late resolve `GenerateContentConfig`s and reduce mutation. by
  @joshualitt in https://github.com/google-gemini/gemini-cli/pull/14920
- Respect previewFeatures value from the remote flag if undefined by @sehoon38
  in https://github.com/google-gemini/gemini-cli/pull/15214
- feat(ui): add Windows clipboard image support and Alt+V paste workaround by
  @jacob314 in https://github.com/google-gemini/gemini-cli/pull/15218
- chore(core): remove legacy fallback flags and migrate loop detection by
  @adamfweidman in https://github.com/google-gemini/gemini-cli/pull/15213
- fix(ui): Prevent eager slash command completion hiding sibling commands by
  @SandyTao520 in https://github.com/google-gemini/gemini-cli/pull/15224
- Docs: Update Changelog for Dec 17, 2025 by @jkcinouye in
  https://github.com/google-gemini/gemini-cli/pull/15204
- Code Assist backend telemetry for user accept/reject of suggestions by
  @gundermanc in https://github.com/google-gemini/gemini-cli/pull/15206
- fix(cli): correct initial history length handling for chat commands by
  @SandyTao520 in https://github.com/google-gemini/gemini-cli/pull/15223
- chore/release: bump version to 0.21.0-nightly.20251218.739c02bd6 by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15231
- Change detailed model stats to use a new shared Table class to resolve
  robustness issues. by @jacob314 in
  https://github.com/google-gemini/gemini-cli/pull/15208
- feat: add agent toml parser by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15112
- Add core tool that adds all context from the core package. by @jacob314 in
  https://github.com/google-gemini/gemini-cli/pull/15238
- (docs): Add reference section to hooks documentation by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15159
- feat(hooks): add support for friendly names and descriptions by @abhipatel12
  in https://github.com/google-gemini/gemini-cli/pull/15174
- feat: Detect background color by @jacob314 in
  https://github.com/google-gemini/gemini-cli/pull/15132
- add 3.0 to allowed sensitive keywords by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15276
- feat: Pass additional environment variables to shell execution by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/15160
- Remove unused code by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15290
- Handle all 429 as retryableQuotaError by @sehoon38 in
  https://github.com/google-gemini/gemini-cli/pull/15288
- Remove unnecessary dependencies by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15291
- fix: prevent infinite loop in prompt completion on error by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/14548
- fix(ui): show command suggestions even on perfect match and sort them by
  @SandyTao520 in https://github.com/google-gemini/gemini-cli/pull/15287
- feat(hooks): reduce log verbosity and improve error reporting in UI by
  @abhipatel12 in https://github.com/google-gemini/gemini-cli/pull/15297
- feat: simplify tool confirmation labels for better UX by @NTaylorMullen in
  https://github.com/google-gemini/gemini-cli/pull/15296
- chore/release: bump version to 0.21.0-nightly.20251219.70696e364 by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15301
- feat(core): Implement JIT context memory loading and UI sync by @SandyTao520
  in https://github.com/google-gemini/gemini-cli/pull/14469
- feat(ui): Put "Allow for all future sessions" behind a setting off by default.
  by @jacob314 in https://github.com/google-gemini/gemini-cli/pull/15322
- fix(cli):change the placeholder of input during the shell mode by
  @JayadityaGit in https://github.com/google-gemini/gemini-cli/pull/15135
- Validate OAuth resource parameter matches MCP server URL by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/15289
- docs(cli): add System Prompt Override (GEMINI_SYSTEM_MD) by @ashmod in
  https://github.com/google-gemini/gemini-cli/pull/9515
- more robust command parsing logs by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15339
- Introspection agent demo by @scidomino in
  https://github.com/google-gemini/gemini-cli/pull/15232
- fix(core): sanitize hook command expansion and prevent injection by
  @SandyTao520 in https://github.com/google-gemini/gemini-cli/pull/15343
- fix(folder trust): add validation for trusted folder level by @adamfweidman in
  https://github.com/google-gemini/gemini-cli/pull/12215
- fix(cli): fix right border overflow in trust dialogs by @galz10 in
  https://github.com/google-gemini/gemini-cli/pull/15350
- fix(policy): fix bug where accepting-edits continued after it was turned off
  by @jacob314 in https://github.com/google-gemini/gemini-cli/pull/15351
- fix: prevent infinite relaunch loop when --resume fails (#14941) by @Ying-xi
  in https://github.com/google-gemini/gemini-cli/pull/14951
- chore/release: bump version to 0.21.0-nightly.20251220.41a1a3eed by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15352
- feat(telemetry): add clearcut logging for hooks by @abhipatel12 in
  https://github.com/google-gemini/gemini-cli/pull/15405
- fix(core): Add `.geminiignore` support to SearchText tool by @xyrolle in
  https://github.com/google-gemini/gemini-cli/pull/13763
- fix(patch): cherry-pick 0843d9a to release/v0.23.0-preview.0-pr-15443 to patch
  version v0.23.0-preview.0 and create version 0.23.0-preview.1 by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15445
- fix(patch): cherry-pick 9cdb267 to release/v0.23.0-preview.1-pr-15494 to patch
  version v0.23.0-preview.1 and create version 0.23.0-preview.2 by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15592
- fix(patch): cherry-pick 37be162 to release/v0.23.0-preview.2-pr-15601 to patch
  version v0.23.0-preview.2 and create version 0.23.0-preview.3 by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/15603
- fix(patch): cherry-pick 07e597d to release/v0.23.0-preview.3-pr-15684
  [CONFLICTS] by @gemini-cli-robot in
  https://github.com/google-gemini/gemini-cli/pull/15734
- fix(patch): cherry-pick c31f053 to release/v0.23.0-preview.4-pr-16004 to patch
  version v0.23.0-preview.4 and create version 0.23.0-preview.5 by
  @gemini-cli-robot in https://github.com/google-gemini/gemini-cli/pull/16027
- fix(patch): cherry-pick 788bb04 to release/v0.23.0-preview.5-pr-15817
  [CONFLICTS] by @gemini-cli-robot in
  https://github.com/google-gemini/gemini-cli/pull/16038

**完整变更日志**:
https://github.com/google-gemini/gemini-cli/compare/v0.22.5...v0.23.0

## Release v0.22.0

### 亮点

- **全面的配额可见性:** 在 `/stats`
  命令中查看所有可用模型的使用统计信息，甚至包括当前会话中未使用的模型。([pic](https://imgur.com/a/cKyDtYh),
  [pr](https://github.com/google-gemini/gemini-cli/pull/14764) by
  [@sehoon38](https://github.com/sehoon38))
- **完善的 CLI 统计信息:** 我们清理了 `/stats`
  视图，以优先显示可操作的配额信息，同时在 `/stats model`
  中提供详细的 token 和缓存效率细分 ([login with Google](https://imgur.com/a/w9xKthm),
  [api key](https://imgur.com/a/FjQPHOY),
  [model stats](https://imgur.com/a/VfWzVgw),
  [pr](https://github.com/google-gemini/gemini-cli/pull/14961) by
  [@jacob314](https://github.com/jacob314))
- **多文件拖放:** 现在支持多文件拖放，并正确翻译为以 `@`
  为前缀。([pr](https://github.com/google-gemini/gemini-cli/pull/14832) by
  [@jackwotherspoon](https://github.com/jackwotherspoon))

(更早的发布说明省略)
