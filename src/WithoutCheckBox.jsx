import { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { Link } from 'react-router-dom'; // Import Link for routing
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const WithoutCheckBox = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
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
    isDragging.current = true;
    start.current = { x: e.pageX, y: e.pageY };
    scroll.current = {
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    };

    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    e.preventDefault();
    const x = e.pageX - start.current.x;
    const y = e.pageY - start.current.y;

    containerRef.current.scrollLeft = scroll.current.left - x;
    containerRef.current.scrollTop = scroll.current.top - y;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = 'auto';
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    document.body.style.userSelect = 'auto';
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
  }, []);

  return (
    <div>
      <nav>
        <p>Page {pageNumber} of {numPages}</p>
        <Link to="/">Go to With Checkbox</Link> {/* Link to App page */}
      </nav>

      <div>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={zoomIn}>Zoom In</button>
        <p>Zoom: {(zoom * 100).toFixed(0)}%</p>
      </div>

      <div
        style={{
          width: '800px',
          height: '600px',
          overflow: 'hidden',
          border: '1px solid #ccc',
          position: 'relative',
        }}
      >
        <div
          ref={containerRef}
          style={{
            overflowY: 'scroll',
            overflowX: 'scroll',
            height: '100%',
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
                  minWidth: '800px',
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

export default WithoutCheckBox;
