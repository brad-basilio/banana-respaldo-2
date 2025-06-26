import React from "react"

const TrackSimple = React.lazy(() => import('./Tracks/TrackSimple'))

const Track = ({ which, data }) => {
  console.log('which', which)
  const getTrack = () => {
    switch (which) {
      case 'TrackSimple':
        return <TrackSimple data={data} />
      default:
        return <div className="w-full px-[5%] replace-max-w-here p-4 mx-auto">- No Hay componente <b>{which}</b> -</div>
    }
  }
  return getTrack()
}

export default Track;