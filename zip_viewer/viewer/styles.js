
const styles = {
  gridStyle: {
    images: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '8px',
      maxWidth: '100vw',
      overflow: 'auto',
      padding: '24px',
    },
    img: {
      width: '100%'
    },
    p: {
      margin: '8px 0 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      // HACK: style属性でサポートされていないのでhtmlの方に記述
      // '-webkit-line-clamp': 2,
      // '-webkit-box-orient': 'vertical'
    }
  }
}

module.exports = styles