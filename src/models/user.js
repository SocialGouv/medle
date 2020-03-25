// from DB entity to JS entity
export const transform = dbData => ({
   id: dbData.id,
   firstName: dbData.first_name,
   lastName: dbData.last_name,
   email: dbData.email,
   role: dbData.role,
   hospital: {
      id: dbData.hospital_id,
      name: dbData.hospital_name || "",
   },
})

export const transformAll = list => list.map(memData => transform(memData))

// from JS entity to DB entity
export const untransform = memData => ({
   id: memData.id,
   first_name: memData.firstName,
   last_name: memData.lastName,
   email: memData.email,
   role: memData.role,
})
