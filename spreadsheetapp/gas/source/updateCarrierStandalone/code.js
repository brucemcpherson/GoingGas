function doUpdate() {
  Carrier.update ( Properties.get() );
}

function setProperties() {
  Properties.set ( {
    carrier: {
      sheet:"lookup",
      id:"1f4zuZZv2NiLuYSGB5j4ENFc6wEWOmaEdCoHNuv-gHXo"
    },
    update: {
      sheet:"updateLookup",
      id:"1DsntVvvA1bIMKVSnvt1f7UKjV5Qz0DtSs8NiI7Kf21g"
    }
  })
}