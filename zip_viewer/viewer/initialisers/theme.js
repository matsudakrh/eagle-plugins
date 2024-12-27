const urlParams = new URLSearchParams(window.location.search)
const theme = urlParams.get('theme')
document.body.setAttribute('theme', theme.toUpperCase())

eagle.onThemeChanged((theme) => {
  document.body.setAttribute('theme', theme.toUpperCase())
})