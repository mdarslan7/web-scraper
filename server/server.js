const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await axios.get(url, {
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });

    if (response.status !== 200) {
      return res.status(response.status).json({
        error: `HTTP error! status: ${response.status}`,
        message: response.statusText
      });
    }

    const $ = cheerio.load(response.data);
    
    // Extract more information
    const title = $('title').text();
    const h1 = $('h1').first().text();
    const metaDescription = $('meta[name="description"]').attr('content');
    const paragraphs = $('p').map((i, el) => $(el).text()).get().slice(0, 5); // Get first 5 paragraphs
    const links = $('a').map((i, el) => ({
      text: $(el).text(),
      href: $(el).attr('href')
    })).get().slice(0, 10); // Get first 10 links

    const images = $('img').map((i, el) => ({
      alt: $(el).attr('alt'),
      src: $(el).attr('src')
    })).get().slice(0, 5); // Get first 5 images

    res.json({
      result: {
        title,
        h1,
        metaDescription,
        paragraphs,
        links,
        images
      }
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'An error occurred while scraping',
      message: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});