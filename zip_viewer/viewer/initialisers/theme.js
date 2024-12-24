const setTheme = () => {
  const theme = window.eagle.app.theme
  if (theme) {
    document.body.setAttribute('theme', theme)
  } else {
    setTimeout(() => {
      const theme = window.eagle.app.theme
      if (theme) {
        document.body.setAttribute('theme', theme)
      }
    }, 200)
  }
}

eagle.onPluginCreate(() => {
  setTheme()
  return  window.createdEaglePlugin = true
})

eagle.onPluginRun(() => {
  setTheme()
})
eagle.onPluginShow(() => {
  setTheme()
})

eagle.onThemeChanged((theme) => {
  console.log(theme)
  document.body.setAttribute('theme', theme)
})