import { useState, useRef, useEffect } from 'react';
import { MapContainer, Popup, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Modal from 'react-modal';
import './App.css';
import Chatbot from "react-chatbot-kit";
import 'react-chatbot-kit/build/main.css';
import config from "./config.jsx";
import MessageParser from './MessageParser.jsx';
import ActionProvider from "./ActionProvider.jsx";
import L from 'leaflet';

function App() {

  const svgIconUrl = 'data:image/svg+xml;base64,' + btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12.031 2c-3.866 0-7 3.1-7 7 0 1.3.402 2.6 1.094 3.7.033.1.059.1.094.2l4.343 8c.204.6.782 1.1 1.438 1.1s1.202-.5 1.406-1.1l4.844-8.7c.499-1 .781-2.1.781-3.2 0-3.9-3.134-7-7-7zM12 5.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z" fill="#c0392b" class="fill-c0392b"></path>
    <path d="M12.031 1.031a7 7 0 0 0-7 7c0 1.383.402 2.665 1.094 3.75.033.053.059.105.094.157L10.562 20c.204.586.782 1.031 1.438 1.031s1.202-.445 1.406-1.031l4.844-8.75c.499-.963.781-2.06.781-3.219a7 7 0 0 0-7-7zM12 5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" fill="#ff3e24" class="fill-e74c3c"></path>
  </svg>
`);
  const customIcon = new L.Icon({
    iconUrl: svgIconUrl,
    iconSize: [32, 32], // Adjust as needed
    iconAnchor: [16, 32], // Adjust as needed
    popupAnchor: [0, -32] // Adjust as needed
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [points, setPoints] = useState([]);

  const mapRefSmall = useRef(null);
  const mapRefModal = useRef(null);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const addPopup = (mapRef, latLng, message) => {
    if (mapRef && mapRef.current) {
      const map = mapRef.current;
      const marker = L.marker(latLng).addTo(map);
      marker.bindPopup(message).openPopup();
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLongitude(position.coords.longitude);
      setLatitude(position.coords.latitude);
    });
  }, []);


  useEffect(() => {
    if (mapRefSmall.current) {
      mapRefSmall.current.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (mapRefModal.current) {
      mapRefModal.current.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude]);


  // useEffect(() => {
  //   if (mapRefSmall.current) {
  //     points.forEach(point => {
  //       addPopup(mapRefSmall, point.loc, point.desc);
  //     });
  //   }
  //   if (mapRefModal.current) {
  //     points.forEach(point => {
  //       addPopup(mapRefModal, point.loc, point.desc);
  //     });
  //   }
  // }, [modalIsOpen, points]);

  return (
    <div className="full">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={(props) => <ActionProvider {...props} setPoints={setPoints} />}
      />
      {!modalIsOpen && <button onClick={openModal} className="open-map-button">Open Map</button>}

      {!modalIsOpen && (
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          style={{ height: "300px", width: "300px", opacity: 1.0 }}
          ref={mapRefSmall}
        >
          <TileLayer
            // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            // 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            // attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
            url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          // url='https://api.mapbox.com/styles/v1/mmaiti/clzd2jtic00e201r475zn4qkl/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibW1haXRpIiwiYSI6ImNsemQxajBmMTBqMzAya3EwMXkyYWV6MmwifQ.27kOwcMtmLA-8o6SH8cOGQ'
          // url="https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=pk.eyJ1IjoibW1haXRpIiwiYSI6ImNsemQxajBmMTBqMzAya3EwMXkyYWV6MmwifQ.27kOwcMtmLA-8o6SH8cOGQ"
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {points.map((point) => {
            return (
              <Marker
                position={point.loc}
                icon={customIcon}
              >
                <Popup className="map-popup">
                  {point.desc}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Full Screen Map"
        className="modal"
        ariaHideApp={false}
        overlayClassName="overlay"
      >
        <button onClick={closeModal} className="close-button">Close</button>
        <div style={{ height: "100vh", width: "100vw" }}>
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRefModal}
          >
            {/*
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
*/}

            <TileLayer
              // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
              url='https://api.mapbox.com/styles/v1/mmaiti/clzd1z5bx00ed01rccu9ca1u3/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibW1haXRpIiwiYSI6ImNsemQxajBmMTBqMzAya3EwMXkyYWV6MmwifQ.27kOwcMtmLA-8o6SH8cOGQ'
            // url="https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=pk.eyJ1IjoibW1haXRpIiwiYSI6ImNsemQxajBmMTBqMzAya3EwMXkyYWV6MmwifQ.27kOwcMtmLA-8o6SH8cOGQ"
            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />



            {points.map((point) => {
              return (
                <Marker
                  position={point.loc}
                  icon={customIcon}
                >
                  <Popup>
                    {point.desc}
                  </Popup>
                </Marker>
              );
            })}

          </MapContainer>
        </div>
      </Modal>
    </div>
  );
}

export default App;
