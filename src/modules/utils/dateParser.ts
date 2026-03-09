

// src/Utils/dateParser.ts
const parseBRDate = (dateStr: string | null): Date | null => {


  if (dateStr === null) return null
  if (String(dateStr) === 'null') return null
  const [date, hour] = dateStr.split('T')
  const [year, month, day] = date.split('-').map(Number);

  const value = new Date(year, month - 1, day);

  return value
};

export default parseBRDate
