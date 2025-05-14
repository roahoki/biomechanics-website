// src/lib/links.ts

export let links = [
    { id: 1, url: 'https://github.com/roahoki/biomechanics-website/' },
    { id: 2, url: 'https://www.biomechanics.cl/' },
  ]
  
  export function updateLinks(newLinks: { id: number; url: string }[]) {
    links = newLinks
  }
  