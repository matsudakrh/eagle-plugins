import AppParameters from '../lib/app-parameters'

document.body.setAttribute('theme', AppParameters.theme)

window.eagle.onThemeChanged((theme) => {
  document.body.setAttribute('theme', theme.toUpperCase())
})