"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [url, setUrl] = useState("");
  const [scrapedData, setScrapedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setScrapedData(null);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || data.error);
      }
      setScrapedData(data.result);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
    setLoading(false);
  };
  
  // Function to ensure the image URL is absolute
  const getAbsoluteUrl = (src) => {
    if (!src) return ""; // Return an empty string or handle undefined src appropriately
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }
    // If it's a relative URL, prepend the base URL
    return new URL(src, url).href;
  };

  return (
    <div className={styles.container}>
      <h1>Web Scraper</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL to scrape"
        className={styles.input}
      />
      <button
        onClick={handleScrape}
        disabled={loading}
        className={styles.button}
      >
        {loading ? "Scraping..." : "Scrape"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
      {scrapedData && (
        <div className={styles.result}>
          <h2>Scraped Data:</h2>
          <h3>Title: {scrapedData.title}</h3>
          <h3>H1: {scrapedData.h1}</h3>
          <h3>Meta Description: {scrapedData.metaDescription}</h3>
          <h3>Paragraphs:</h3>
          <ul>
            {scrapedData.paragraphs.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <h3>Links:</h3>
          <ul>
            {scrapedData.links.map((link, i) => (
              <li key={i}>
                <a
                  href={getAbsoluteUrl(link.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
          <h3>Images:</h3>
          <ul className={styles.imageList}>
            {scrapedData.images.map((img, i) => (
              <li key={i} className={styles.imageItem}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={getAbsoluteUrl(img.src)}
                    alt={img.alt || "Scraped image"}
                    width={100}
                    height={100}
                    className={styles.thumbnail}
                  />
                </div>
                <p>{img.alt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
