# Change Log

## [1.1.5](https://github.com/janghye0k/snow-datepicker/compare/v1.1.4...v1.1.5) (2024-07-17)


### Bug Fixes

* resolve formatting error when escape string is exist, add a class when the user provides the custom button option, fix the navigation up/down key changed during month/year/decade ([34854aa](https://github.com/janghye0k/snow-datepicker/commit/34854aa04bdc22b690d7c2ecfc722e4159c8a3e0))

## [1.1.4](https://github.com/janghye0k/snow-datepicker/compare/v1.1.3...v1.1.4) (2024-07-16)


### Bug Fixes

* resolve an error in which calendar does not work properly when there are multiple datepickers ([e461efe](https://github.com/janghye0k/snow-datepicker/commit/e461efe5f1885e2f899db2636b5e6fb3bc0913f4))

## [1.1.3](https://github.com/janghye0k/snow-datepicker/compare/v1.1.2...v1.1.3) (2024-07-16)


### Bug Fixes

* resolve datelike selection error ([eb4ade6](https://github.com/janghye0k/snow-datepicker/commit/eb4ade623326c4031ac46ccec3d3ddc856572352))

## [1.1.2](https://github.com/janghye0k/snow-datepicker/compare/v1.1.1...v1.1.2) (2024-07-16)


### Bug Fixes

* resolve the error that sets the date when the input element is blurred when there is no date selected ([61b6c10](https://github.com/janghye0k/snow-datepicker/commit/61b6c109aa31d9029ce3faf4d78036471ce820e1))

## [1.1.1](https://github.com/janghye0k/snow-datepicker/compare/v1.1.0...v1.1.1) (2024-07-16)


### Bug Fixes

* resolve invalid export settings ([41c9ce6](https://github.com/janghye0k/snow-datepicker/commit/41c9ce64dd15f67e13fc0f9027e682b5667be8df))

# [1.1.0](https://github.com/janghye0k/snow-datepicker/compare/v1.0.0...v1.1.0) (2024-07-16)


### Features

* options.button - add style option ([92f587d](https://github.com/janghye0k/snow-datepicker/commit/92f587d799e575e08c9a9008003f0642da54b5b8))

# 1.0.0 (2024-07-16)

### Bug Fixes

- buttons validation ([ba1dc07](https://github.com/janghye0k/snow-datepicker/commit/ba1dc07f0f288a1be973266cdf0f35571abce0d6))
- cell not focus out when calendar prev(next) button is focused ([e89a01a](https://github.com/janghye0k/snow-datepicker/commit/e89a01a368468d8e17d5a75bae12305bd546678e))
- converter.format, minutes convert error ([f6a2cde](https://github.com/janghye0k/snow-datepicker/commit/f6a2cde5dcd2984d3dc24d6a4bc4b3593186f6f3))
- destory instance ([1985b50](https://github.com/janghye0k/snow-datepicker/commit/1985b50f9603c15d608ea5c815022bb8d1046033))
- error restarting animation when running show function when datepicker is visible ([231656a](https://github.com/janghye0k/snow-datepicker/commit/231656af372b20fd498a0ff5c50eec845cdc0795))
- options.inline, options.size ([57a0d7d](https://github.com/janghye0k/snow-datepicker/commit/57a0d7d3434bc5553e5a155b85b143f7bdccfcab))
- options.readOnly not worked ([b692e9d](https://github.com/janghye0k/snow-datepicker/commit/b692e9dd2160cb4d8b3fc6a39eb5c872c8a760fb))
- schema error message ([04be7b9](https://github.com/janghye0k/snow-datepicker/commit/04be7b9393ca080696c43b0fb75b8c7ad6eaf393))
- shortcut controls (not work at unit changing, focus element not changed) ([b64beeb](https://github.com/janghye0k/snow-datepicker/commit/b64beebf5b59bf64c3110bbd98cad12e4f6dd7a6))
- shortcut decade year move ([ba24241](https://github.com/janghye0k/snow-datepicker/commit/ba24241e98770b7b2192c248c0187493d880ee3f))
- troubleshooting errors with keydown event not working ([824f3ae](https://github.com/janghye0k/snow-datepicker/commit/824f3aeb6407c541ec0c07e41a8e3689b01aca95))

### Features

- ability to represent the value of an input in any format ([720de01](https://github.com/janghye0k/snow-datepicker/commit/720de01e3619d9eb09b377c9bcabd75fa3261135))
- add aria-role, tabindex ([bc36434](https://github.com/janghye0k/snow-datepicker/commit/bc3643423b6033f0c77e46ecec9bf9b32ab3fdb3))
- add days rendering function ([d80e210](https://github.com/janghye0k/snow-datepicker/commit/d80e210244dd781f3fd9c417114a8a3044ed3435))
- add function isSameDate ([90e23bc](https://github.com/janghye0k/snow-datepicker/commit/90e23bc4b967448c0582848b68b21b0018840297))
- add subscribe method ([89249af](https://github.com/janghye0k/snow-datepicker/commit/89249af7aca9dee4e4ef2185f8744714d14fdfed))
- add theme options ([c09dd6b](https://github.com/janghye0k/snow-datepicker/commit/c09dd6b6546e727081f1886c8dd6e743a374762d))
- add utility lib & refactor events ([e5c29bd](https://github.com/janghye0k/snow-datepicker/commit/e5c29bd7a5bb53cb1798aaf98062c2856fe5eefe))
- apply options.locale ([481dfba](https://github.com/janghye0k/snow-datepicker/commit/481dfbac18e3fd7d695c30f5e09f3775137e813d))
- calendar rendering & datepicker event registration and invocation complete ([3244653](https://github.com/janghye0k/snow-datepicker/commit/32446533e3c9246a339c30c7ae559f6ee3f7f6a2))
- change library name, snow-datepicker ([7dab4f2](https://github.com/janghye0k/snow-datepicker/commit/7dab4f20e675c05ec2f2fed2367fdf06147c1172))
- change options dateLike value to Date ([c8d6cca](https://github.com/janghye0k/snow-datepicker/commit/c8d6cca213aa52844d741ca13d811ccad37f3a86))
- change util.isDate ([656503e](https://github.com/janghye0k/snow-datepicker/commit/656503ef497a98b9e1c17fea7898239f88dc01f3))
- create Cell components & render calendar cell ([8c03ba4](https://github.com/janghye0k/snow-datepicker/commit/8c03ba41f96b213a459309ae9972764459f6127a))
- create consts.ts for constant variables, move checkDateFormat function to Target component ([2b38319](https://github.com/janghye0k/snow-datepicker/commit/2b383190d5afdd373be4adb417d9b63a90233790))
- create event manager ([5e78819](https://github.com/janghye0k/snow-datepicker/commit/5e788196e261e5c9e0fd37f3b3c801e72209945c))
- create locale converter for format by options.locale ([bfcd652](https://github.com/janghye0k/snow-datepicker/commit/bfcd65293d737ab081dc8f47cee90c5c5fc177aa))
- create locale option manually ([41ea41b](https://github.com/janghye0k/snow-datepicker/commit/41ea41b2e0f63ba7b2d2dd24e64dad2197ca7f0b))
- create util ([35a623c](https://github.com/janghye0k/snow-datepicker/commit/35a623c9bdb9847b61cd3177f32174bef5f32ff7))
- define event object ([bf67358](https://github.com/janghye0k/snow-datepicker/commit/bf67358fa5ad310bff07319d12428be77ebd95f0))
- dev content ([14200b2](https://github.com/janghye0k/snow-datepicker/commit/14200b2bf65a1ee022cb44e9450b7d91a9c48ce0))
- disable outrange date cell & navigationLoop ([0372a12](https://github.com/janghye0k/snow-datepicker/commit/0372a12913f1ce487770bcaa5327b806f8b5ccf4))
- event manager bind options event when initialize datepicker ([4819bd1](https://github.com/janghye0k/snow-datepicker/commit/4819bd11e2563c46e2595b0f0c045e087323a789))
- **event:** change declaration ([4af343a](https://github.com/janghye0k/snow-datepicker/commit/4af343a7352fb39277e33d3bec1f877bbbe0343e))
- **helpers:** add schema validation for all options property ([71b3c6b](https://github.com/janghye0k/snow-datepicker/commit/71b3c6b72abfce55b69032edde9381f16f7eccab))
- include locale month, weekday formatter ([f5a7e53](https://github.com/janghye0k/snow-datepicker/commit/f5a7e53c6b56f65c57adb51bae26467473ca966d))
- inline options ([0bc6704](https://github.com/janghye0k/snow-datepicker/commit/0bc67044dd695add5e88507247c374cd8283d483))
- input selection move by tab ([d22254b](https://github.com/janghye0k/snow-datepicker/commit/d22254b9b692911421b2c193d37aaf159b05bc56))
- keyboard shortcuts ([624f648](https://github.com/janghye0k/snow-datepicker/commit/624f648989766b19b82c0c6b39db8bf97055ab6d))
- link options.minUnit to the input value ([15bcbaa](https://github.com/janghye0k/snow-datepicker/commit/15bcbaa042bafb3737e35296c210c677ebe6ca32))
- minDate & maxDate features ([36b043e](https://github.com/janghye0k/snow-datepicker/commit/36b043e2d7146626463ef875aaa3503c3b84afb2))
- options.backdrop for mobile ([43cd2ef](https://github.com/janghye0k/snow-datepicker/commit/43cd2ef6a5a4327db187cb52d0aaa31f1517a1b9))
- options.button ([4e28ea3](https://github.com/janghye0k/snow-datepicker/commit/4e28ea3ad43ede7e411b01f56a92c2c0fc65f21f))
- paste edit, fix selection when focus or click ([e9926d1](https://github.com/janghye0k/snow-datepicker/commit/e9926d1be0c616e8f2c318ab464d065958d6e4d0))
- popup - calendar show when user click input ([b6a6676](https://github.com/janghye0k/snow-datepicker/commit/b6a6676236bf456dbc6e67ed11e6c62f4c392dcf))
- remove init by options value ([468cd23](https://github.com/janghye0k/snow-datepicker/commit/468cd23d0e66b7af9a9cabbdf2d224204205a5d7))
- rename - options.format => options.dateFormat ([22fc516](https://github.com/janghye0k/snow-datepicker/commit/22fc5163d64c16030f86f83090cee903efc0808f))
- rename unit => view ([0306feb](https://github.com/janghye0k/snow-datepicker/commit/0306feb295afa81f773347cb52cd2e856de26a11))
- rendering calendar when unit changed ([348fcba](https://github.com/janghye0k/snow-datepicker/commit/348fcba1235d0188865622b5dc1d5a79561c67e5))
- set options ([74db54b](https://github.com/janghye0k/snow-datepicker/commit/74db54b252478d363303215f133b274cf9cfbf8d))
- showOtherMonths, selectOtherMonths, moveOtherMonths, toggleSelected ([f82a243](https://github.com/janghye0k/snow-datepicker/commit/f82a24339c1a4fd3bec50ac16dae1d979e80e281))
- size optiolns, add a small size make it look like an input[type="date"] ([cc306a0](https://github.com/janghye0k/snow-datepicker/commit/cc306a0917a91e493082b92dada7daff98d27cae))
- update checkSchema ([484fd04](https://github.com/janghye0k/snow-datepicker/commit/484fd04d90f40f549ee384fbafa210c88aade470))
- update helpers ([5bc7f24](https://github.com/janghye0k/snow-datepicker/commit/5bc7f2473a12e3219a3b32c44f104038f5e563b6))
- update schema validation ([6c839f1](https://github.com/janghye0k/snow-datepicker/commit/6c839f1f55a32cf591bf4a0b6688b323160d30e0))
- update utils (add add/remove eventlistener util) ([b04651e](https://github.com/janghye0k/snow-datepicker/commit/b04651e9332cf5e8cb265bf3cadccd6ed11649e6))
- **utils:** remove multiple classname select ([b53ea2c](https://github.com/janghye0k/snow-datepicker/commit/b53ea2c17627bb6d5ebe5bcf7f6c769f02af8f0d))

# 1.0.0 (2024-02-28)

### Bug Fixes

- buttons validation ([ba1dc07](https://github.com/janghye0k/datepicker/commit/ba1dc07f0f288a1be973266cdf0f35571abce0d6))
- cell not focus out when calendar prev(next) button is focused ([e89a01a](https://github.com/janghye0k/datepicker/commit/e89a01a368468d8e17d5a75bae12305bd546678e))
- error restarting animation when running show function when datepicker is visible ([231656a](https://github.com/janghye0k/datepicker/commit/231656af372b20fd498a0ff5c50eec845cdc0795))
- schema error message ([04be7b9](https://github.com/janghye0k/datepicker/commit/04be7b9393ca080696c43b0fb75b8c7ad6eaf393))
- shortcut controls (not work at unit changing, focus element not changed) ([b64beeb](https://github.com/janghye0k/datepicker/commit/b64beebf5b59bf64c3110bbd98cad12e4f6dd7a6))
- shortcut decade year move ([ba24241](https://github.com/janghye0k/datepicker/commit/ba24241e98770b7b2192c248c0187493d880ee3f))

### Features

- ability to represent the value of an input in any format ([720de01](https://github.com/janghye0k/datepicker/commit/720de01e3619d9eb09b377c9bcabd75fa3261135))
- add aria-role, tabindex ([bc36434](https://github.com/janghye0k/datepicker/commit/bc3643423b6033f0c77e46ecec9bf9b32ab3fdb3))
- add days rendering function ([d80e210](https://github.com/janghye0k/datepicker/commit/d80e210244dd781f3fd9c417114a8a3044ed3435))
- add function isSameDate ([90e23bc](https://github.com/janghye0k/datepicker/commit/90e23bc4b967448c0582848b68b21b0018840297))
- add subscribe method ([89249af](https://github.com/janghye0k/datepicker/commit/89249af7aca9dee4e4ef2185f8744714d14fdfed))
- add theme options ([c09dd6b](https://github.com/janghye0k/datepicker/commit/c09dd6b6546e727081f1886c8dd6e743a374762d))
- add utility lib & refactor events ([e5c29bd](https://github.com/janghye0k/datepicker/commit/e5c29bd7a5bb53cb1798aaf98062c2856fe5eefe))
- apply options.locale ([481dfba](https://github.com/janghye0k/datepicker/commit/481dfbac18e3fd7d695c30f5e09f3775137e813d))
- calendar rendering & datepicker event registration and invocation complete ([3244653](https://github.com/janghye0k/datepicker/commit/32446533e3c9246a339c30c7ae559f6ee3f7f6a2))
- change options dateLike value to Date ([c8d6cca](https://github.com/janghye0k/datepicker/commit/c8d6cca213aa52844d741ca13d811ccad37f3a86))
- change util.isDate ([656503e](https://github.com/janghye0k/datepicker/commit/656503ef497a98b9e1c17fea7898239f88dc01f3))
- create Cell components & render calendar cell ([8c03ba4](https://github.com/janghye0k/datepicker/commit/8c03ba41f96b213a459309ae9972764459f6127a))
- create consts.ts for constant variables, move checkDateFormat function to Target component ([2b38319](https://github.com/janghye0k/datepicker/commit/2b383190d5afdd373be4adb417d9b63a90233790))
- create event manager ([5e78819](https://github.com/janghye0k/datepicker/commit/5e788196e261e5c9e0fd37f3b3c801e72209945c))
- create locale converter for format by options.locale ([bfcd652](https://github.com/janghye0k/datepicker/commit/bfcd65293d737ab081dc8f47cee90c5c5fc177aa))
- create locale option manually ([41ea41b](https://github.com/janghye0k/datepicker/commit/41ea41b2e0f63ba7b2d2dd24e64dad2197ca7f0b))
- create util ([35a623c](https://github.com/janghye0k/datepicker/commit/35a623c9bdb9847b61cd3177f32174bef5f32ff7))
- define event object ([bf67358](https://github.com/janghye0k/datepicker/commit/bf67358fa5ad310bff07319d12428be77ebd95f0))
- dev content ([14200b2](https://github.com/janghye0k/datepicker/commit/14200b2bf65a1ee022cb44e9450b7d91a9c48ce0))
- disable outrange date cell & navigationLoop ([0372a12](https://github.com/janghye0k/datepicker/commit/0372a12913f1ce487770bcaa5327b806f8b5ccf4))
- event manager bind options event when initialize datepicker ([4819bd1](https://github.com/janghye0k/datepicker/commit/4819bd11e2563c46e2595b0f0c045e087323a789))
- include locale month, weekday formatter ([f5a7e53](https://github.com/janghye0k/datepicker/commit/f5a7e53c6b56f65c57adb51bae26467473ca966d))
- inline options ([0bc6704](https://github.com/janghye0k/datepicker/commit/0bc67044dd695add5e88507247c374cd8283d483))
- input selection move by tab ([d22254b](https://github.com/janghye0k/datepicker/commit/d22254b9b692911421b2c193d37aaf159b05bc56))
- keyboard shortcuts ([624f648](https://github.com/janghye0k/datepicker/commit/624f648989766b19b82c0c6b39db8bf97055ab6d))
- link options.minUnit to the input value ([15bcbaa](https://github.com/janghye0k/datepicker/commit/15bcbaa042bafb3737e35296c210c677ebe6ca32))
- minDate & maxDate features ([36b043e](https://github.com/janghye0k/datepicker/commit/36b043e2d7146626463ef875aaa3503c3b84afb2))
- options.backdrop for mobile ([43cd2ef](https://github.com/janghye0k/datepicker/commit/43cd2ef6a5a4327db187cb52d0aaa31f1517a1b9))
- options.button ([4e28ea3](https://github.com/janghye0k/datepicker/commit/4e28ea3ad43ede7e411b01f56a92c2c0fc65f21f))
- paste edit, fix selection when focus or click ([e9926d1](https://github.com/janghye0k/datepicker/commit/e9926d1be0c616e8f2c318ab464d065958d6e4d0))
- popup - calendar show when user click input ([b6a6676](https://github.com/janghye0k/datepicker/commit/b6a6676236bf456dbc6e67ed11e6c62f4c392dcf))
- remove init by options value ([468cd23](https://github.com/janghye0k/datepicker/commit/468cd23d0e66b7af9a9cabbdf2d224204205a5d7))
- rename - options.format => options.dateFormat ([22fc516](https://github.com/janghye0k/datepicker/commit/22fc5163d64c16030f86f83090cee903efc0808f))
- rename unit => view ([0306feb](https://github.com/janghye0k/datepicker/commit/0306feb295afa81f773347cb52cd2e856de26a11))
- rendering calendar when unit changed ([348fcba](https://github.com/janghye0k/datepicker/commit/348fcba1235d0188865622b5dc1d5a79561c67e5))
- set options ([74db54b](https://github.com/janghye0k/datepicker/commit/74db54b252478d363303215f133b274cf9cfbf8d))
- showOtherMonths, selectOtherMonths, moveOtherMonths, toggleSelected ([f82a243](https://github.com/janghye0k/datepicker/commit/f82a24339c1a4fd3bec50ac16dae1d979e80e281))
- size optiolns, add a small size make it look like an input[type="date"] ([cc306a0](https://github.com/janghye0k/datepicker/commit/cc306a0917a91e493082b92dada7daff98d27cae))
- update checkSchema ([484fd04](https://github.com/janghye0k/datepicker/commit/484fd04d90f40f549ee384fbafa210c88aade470))
- update helpers ([5bc7f24](https://github.com/janghye0k/datepicker/commit/5bc7f2473a12e3219a3b32c44f104038f5e563b6))
- update schema validation ([6c839f1](https://github.com/janghye0k/datepicker/commit/6c839f1f55a32cf591bf4a0b6688b323160d30e0))
- update utils (add add/remove eventlistener util) ([b04651e](https://github.com/janghye0k/datepicker/commit/b04651e9332cf5e8cb265bf3cadccd6ed11649e6))
