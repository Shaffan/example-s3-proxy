module.exports = {
  isImage(filename) {
    return ['.jpg', '.jpeg', '.png', '.gif', '.svg'].some((ext) =>
      filename.toUpperCase().endsWith(ext.toUpperCase())
    )
  }
}
