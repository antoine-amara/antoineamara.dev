export function renderMyWorkElements ({ data: dataFromAPI }) {
  const BADGE_COLOR_MAPPING = {
    opensource: 'badge--green',
    javascript: 'badge--yellow',
    arduino: 'bagde--light-green',
    shell: 'badge--dark-grey',
    typescript: 'badge--dark-blue'
  }
  const projectsRootElement = document.getElementsByClassName('projects')[0]
  projectsRootElement.style.display = 'flex'

  dataFromAPI.forEach(project => {
    const { openGraphImageUrl, name, descriptionHTML, primaryLanguage } = project

    const projectCard = document.createElement('DIV')
    projectCard.classList.toggle('project-card')

    const imgContainer = document.createElement('DIV')
    imgContainer.classList.toggle('project-card__img')
    const projectImg = document.createElement('IMG')
    projectImg.src = openGraphImageUrl
    imgContainer.appendChild(projectImg)

    projectCard.append(imgContainer)

    const projectName = document.createElement('H3')
    projectName.classList.toggle('project-card__name')
    projectName.innerHTML = name

    projectCard.appendChild(projectName)

    const projectDescription = document.createElement('P')
    projectDescription.classList.toggle('project-card__description')
    projectDescription.innerHTML = descriptionHTML

    projectCard.appendChild(projectDescription)

    const badgeContainer = document.createElement('DIV')
    badgeContainer.classList.toggle('project-card__badges')
    const badges = ['opensource', primaryLanguage.name.toLowerCase()]
    badges.forEach(badgeName => {
      const badge = document.createElement('DIV')
      badge.classList.toggle('badge')
      badge.classList.toggle(BADGE_COLOR_MAPPING[badgeName])
      badge.innerHTML = badgeName
      badgeContainer.appendChild(badge)
    })
    projectCard.appendChild(badgeContainer)

    projectsRootElement.appendChild(projectCard)
  })

  return projectsRootElement
}