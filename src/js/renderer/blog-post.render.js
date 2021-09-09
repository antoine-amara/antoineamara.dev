function renderEmptyBlogPostElement () {
  const emptyPostsElement = document.getElementsByClassName('blog-post__empty')[0]
  emptyPostsElement.style.display = 'flex'

  return null
}

export function renderBlogPostElements (dataFromAPI) {
  if (!dataFromAPI.length) {
    renderEmptyBlogPostElement()
  }

  const blogPostsContainer = document.getElementsByClassName('blog-post__container')[0]
  blogPostsContainer.style.display = 'block'

  dataFromAPI.forEach((post, index) => {
    const { title, publishDate, tagList, url } = post

    const postElement = document.createElement('DIV')
    postElement.classList.toggle('post')

    const titleElement = document.createElement('A')
    titleElement.classList.toggle('post__title')
    titleElement.href = url
    titleElement.target = '_blank'
    titleElement.innerHTML = title
    postElement.appendChild(titleElement)

    const publishDateElement = document.createElement('DIV')
    publishDateElement.classList.toggle('post__date')
    const [, parsedMonth, parsedDay, parsedYear] = new Date(publishDate).toDateString().split(' ')
    publishDateElement.innerHTML = `publised on ${parsedMonth} ${parsedDay} ${parsedYear}`
    postElement.appendChild(publishDateElement)

    const categorieContainer = document.createElement('DIV')
    categorieContainer.classList.toggle('post__categorie-container')
    tagList.forEach(tag => {
      const badgeElement = document.createElement('DIV')
      badgeElement.classList.toggle('badge')
      badgeElement.classList.toggle('badge--grey-opacity')
      badgeElement.innerHTML = '#' + tag
      categorieContainer.appendChild(badgeElement)
    })
    postElement.appendChild(categorieContainer)

    blogPostsContainer.appendChild(postElement)

    if (index !== dataFromAPI.length - 1) {
      const separator = document.createElement('HR')
      separator.classList.toggle('blog-post__separator')
      blogPostsContainer.appendChild(separator)
    }
  })

  return blogPostsContainer
}
