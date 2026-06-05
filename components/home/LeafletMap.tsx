'use client'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BHAVANS } from '@/lib/bhavans-data'
import { useRouter } from 'next/navigation'

const BHAVAN_COORDS: Record<string, [number, number]> = {
  azad: [29.8643, 77.8964],
  cautley: [29.8694, 77.9009],
  ganga: [29.8711, 77.8974],
  govind: [29.8658, 77.8988],
  jawahar: [29.8682, 77.8981],
  rajendra: [29.8633, 77.8938],
  radhakrishnan: [29.8623, 77.8972],
  rajiv: [29.8741, 77.8931],
  ravindra: [29.8719, 77.8942],
  malviya: [29.8641, 77.8948],
  vivekanand: [29.8679, 77.8935],
  sarojini: [29.8714, 77.8989],
  kasturba: [29.8651, 77.8961],
  indira: [29.8648, 77.8942],
  himalaya: [29.8628, 77.8931],
  'gp-hostel': [29.8604, 77.8951],
  'mr-chopra': [29.8614, 77.8934],
  'azad-wing': [29.8649, 77.8959],
  'an-khosla': [29.8618, 77.8988],
  kih: [29.8627, 77.8993],
  vigyan: [29.8671, 77.8921],
}

export default function LeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [locateError, setLocateError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map centered on IIT Roorkee Main Building (Thomson Building)
    const map = L.map(mapContainerRef.current, {
      center: [29.8702, 77.8961],
      zoom: 15,
      zoomControl: false,
    })
    mapRef.current = map

    // Add zoom control customly
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add CartoDB Positron Tile layer (Uber-style gray and white)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    // Loop through Bhavans data and add markers
    BHAVANS.forEach(b => {
      const coords = BHAVAN_COORDS[b.slug]
      if (!coords) return

      const pinColor = b.theme.primary || '#1e2a3b'
      const icon = L.divIcon({
        className: 'custom-bhavan-marker',
        html: `
          <div class="relative flex items-center justify-center" style="width: 24px; height: 24px; transform: translate(-6px, -6px);">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-35" style="background-color: ${pinColor}"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white shadow-md" style="background-color: ${pinColor}"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(coords, { icon }).addTo(map)

      // Add popup
      const popupContent = document.createElement('div')
      popupContent.className = 'p-4 flex flex-col gap-2.5 min-w-[170px]'
      popupContent.innerHTML = `
        <div>
          <p class="font-bold text-sm text-gray-950">${b.name}</p>
          <p class="text-[9px] text-gray-500 font-extrabold uppercase mt-0.5 tracking-wider">${b.category} Hostel ${b.established ? `· Est. ${b.established}` : ''}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}" target="_blank" rel="noopener noreferrer" class="w-full text-center py-2 px-3 bg-gray-950 text-white rounded-lg text-[9px] font-bold tracking-widest uppercase hover:bg-black transition-colors block decoration-none">
            Directions
          </a>
          <button class="visit-bhavan-btn w-full text-center py-2 px-3 bg-white text-gray-950 border border-gray-200 rounded-lg text-[9px] font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors block cursor-pointer">
            Visit Info
          </button>
        </div>
      `

      // Handle visit info click inside the popup
      popupContent.querySelector('.visit-bhavan-btn')?.addEventListener('click', () => {
        router.push(`/bhavans/${b.slug}`)
      })

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -5],
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [router])

  // Locate User Function
  const locateUser = () => {
    if (!mapRef.current) return
    setLocating(true)
    setLocateError(null)

    if (!navigator.geolocation) {
      setLocateError('Geolocation not supported')
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        const map = mapRef.current
        if (!map) return

        map.setView([latitude, longitude], 17)

        const userIcon = L.divIcon({
          className: 'user-marker',
          html: `
            <div class="relative flex items-center justify-center" style="width: 28px; height: 28px; transform: translate(-8px, -8px);">
              <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-60"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude])
        } else {
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map)
        }

        setLocating(false)
      },
      error => {
        console.error('Geolocation error:', error)
        setLocateError('Unable to get location')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="relative w-full h-full min-h-[480px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-0" />

      <button
        onClick={locateUser}
        disabled={locating}
        className="absolute top-4 right-4 z-[400] bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold p-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer text-xs disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {locating ? (
          <>
            <svg className="animate-spin h-4 w-4 text-gray-600 animate-infinite" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Locating...</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            <span>Locate Me</span>
          </>
        )}
      </button>

      {locateError && (
        <div className="absolute top-16 right-4 z-[400] bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-md uppercase tracking-wider">
          {locateError}
        </div>
      )}
    </div>
  )
}
