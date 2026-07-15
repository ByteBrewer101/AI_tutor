export function shouldShowCoffeeRing(accessCount) {
  return accessCount >= 5
}

export function shouldShowDogEar(completedCount, totalCount) {
  return totalCount > 0 && completedCount === totalCount
}

export function getPaperAge(createdAt) {
  const now = new Date()
  const created = new Date(createdAt)
  const days = Math.floor((now - created) / (1000 * 60 * 60 * 24))

  if (days < 7) return 'new'
  if (days < 30) return 'fresh'
  if (days < 90) return 'worn'
  return 'well-loved'
}

export function getAgeOpacity(age) {
  const map = {
    new: 0,
    fresh: 0.01,
    worn: 0.02,
    'well-loved': 0.04,
  }
  return map[age] || 0
}
