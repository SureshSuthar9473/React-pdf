import { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './App.css';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const App = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [selectEnabled, setSelectEnabled] = useState(false);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const zoomIn = () => setZoom((prevZoom) => prevZoom + 0.1);
  const zoomOut = () => setZoom((prevZoom) => (prevZoom > 0.1 ? prevZoom - 0.1 : 0.1));

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const pageHeight = containerRef.current.clientHeight;
      const currentPage = Math.floor(scrollTop / pageHeight) + 1;
      setPageNumber(currentPage);
    }
  };

  const handleMouseDown = (e) => {
    if (selectEnabled) return; // Prevent dragging if text selection is enabled

    isDragging.current = true;
    start.current = { x: e.pageX, y: e.pageY };
    scroll.current = {
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    };

    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (selectEnabled || !isDragging.current) return; // Stop dragging if text selection is enabled

    e.preventDefault();
    const x = e.pageX - start.current.x;
    const y = e.pageY - start.current.y;

    containerRef.current.scrollLeft = scroll.current.left - x;
    containerRef.current.scrollTop = scroll.current.top - y;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = selectEnabled ? 'auto' : 'none';
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    document.body.style.userSelect = selectEnabled ? 'auto' : 'none';
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [selectEnabled]); // Re-attach events based on selection state

  return (
    <div>
      <nav>
        <p>
          Page {pageNumber} of {numPages}
        </p>
      </nav>

      <div>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={zoomIn}>Zoom In</button>
        <p>Zoom: {(zoom * 100).toFixed(0)}%</p>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={selectEnabled}
            onChange={() => setSelectEnabled((prev) => !prev)}
          />
          Enable Text Selection
        </label>
      </div>

      <div
        style={{
          width: '800px', // Fixed width for the container
          height: '600px', // Fixed height for the container
          overflow: 'hidden', // Hide any overflow from the container
          border: '1px solid #ccc', // Optional styling for the container
          position: 'relative', // Relative positioning for absolute children
        }}
      >
        <div
          ref={containerRef}
          style={{
            overflowY: 'scroll',
            overflowX: 'scroll',
            height: '100%', // Fill the height of the parent
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            cursor: isDragging.current ? 'grabbing' : 'grab',
          }}
        >
          <Document
            file="/sample-terms-conditions-agreement.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                style={{
                  minWidth: '800px', // Ensure each page fits the container's width
                  flexShrink: 0,
                }}
              >
                <Page pageNumber={index + 1} scale={zoom} />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default App;
