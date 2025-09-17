// Consistent title display utility for glow effects across all components

export const getTitleClasses = (title: string | null | undefined, baseClasses: string = ""): string => {
  if (!title) return baseClasses;
  
  const glowClass = title.includes('RCCS') ? 'title-glow-aqua' :
                   title.includes('ELITE') ? 'title-glow-golden' :
                   title.includes('GRAND CHAMPION') ? 'title-glow-golden' :
                   title.startsWith('RANKED #') ? 'title-glow-rainbow' :
                   title === 'LEGEND' ? 'title-glow-legend' :
                   '';
  
  return `${baseClasses} ${glowClass}`.trim();
};

export const getTitleDisplayClasses = (title: string | null | undefined, teamColor?: 'red' | 'blue' | 'neutral'): string => {
  if (!title) return '';
  
  const baseColor = teamColor === 'red' ? 'text-red-300' :
                   teamColor === 'blue' ? 'text-blue-300' :
                   'text-gray-300';
  
  return getTitleClasses(title, `text-xs mt-1 ${baseColor}`);
};