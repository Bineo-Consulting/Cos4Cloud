const parseTaxon = (taxon) => {
  return {
    "id": taxon.taxonKey || taxonId || taxonID || taxon.id || null,
    "ancestry": taxon.ancestry || null,
    "rank": taxon.rank || null,
    "rank_level": taxon.rank_level || null,
    "kingdom": taxon.kingdom || taxon.iconic_taxon_name || null,
    "phylum": taxon.phylum || null,
    "class": taxon.class || null,
    "order": taxon.order || null,
    "family": taxon.family || null,
    "genus": taxon.genus || null,
    "name": taxon.name || null,

    "url": taxon.image_url || null,
    "common_name": taxon.common_name || null,
    "createdAt": new Date(taxon.created_at || null)
  }
}

const dwcParse = (item) => {
  const aux = {}
  aux.id = `${item.id}`.includes('-') ? item.id : `gbif-${item.id}`
  aux.eventDate = new Date(item.eventDate)
  aux.created_at = aux.eventDate // for sorting
  aux.observedOn = aux.eventDate // for sorting

  aux.taxon = parseTaxon(item)
  aux.scientificName = item.scientificName || item.species_name || (item.taxon || {}).name || 'Something...'
  aux.ownerInstitutionCodeProperty = 'Gbif' // origin
  aux.origin = 'Gbif' // origin

  aux.identificationVerificationStatus = item.quality_grade
  aux.license = item.license || null
  aux.rightsHolder = item.rightsHolder || (item.user || '').login || item.user_login || null
  aux.description = item.description || null

  // photos
  aux.media = (item.media || item.photos || item.observation_photos || []).map(item => ({
    type: "StillImage",
    format: "image/jpeg",
    license: item.license,
    rightsHolder: item.native_realname,
    identifier: (item.photo && item.photo.large_url ? item.photo.large_url : item.large_url || '').replace('http:', 'https:'),
    medium_url: (item.photo && item.photo.medium_url ? item.photo.medium_url : item.medium_url || '').replace('http:', 'https:'),
    large_url: (item.photo && item.photo.large_url ? item.photo.large_url : item.large_url || '').replace('http:', 'https:')
  }))

  // user
  aux.user = item.user || { login: item.rightsHolder || item.user_login } || null

  // Location
  aux.decimalLatitude = item.decimalLatitude || item.latitude || null
  aux.decimalLongitude = item.decimalLongitude || item.longitude || null

  // comments
  aux.comments = (item.comments || []).map(item => {
    return {
      "createdAt": new Date(item.created_at),
      "updatedAt": new Date(item.updated_at),
      "id": item.id,
      "observation_id": item.observation_id,
      "origin": aux.origin,
      "user_id": item.user_id || null,
      "comment": item.body || null,
      "user": { login: (item.user || {}).login }
    }
  })
  aux.identifications = (item.identifications || []).map(item => {
    return {
      "createdAt": new Date(item.created_at),
      "updatedAt": new Date(item.updated_at),
      "id": item.id,
      "observation_id": item.observation_id,
      "origin": aux.origin,
      "taxon_id": item.taxon_id || null,
      "user_id": item.user_id || null,
      comment: item.body || null,
      user: { login: (item.user || {}).login },
      taxon: parseTaxon(item.taxon || {})
    }
  })

  return aux
}

module.exports = {
  mapping: (item) => {
    item.id = `gbif-${item.key}`
    return {...dwcParse(item), ...item}
  }
}