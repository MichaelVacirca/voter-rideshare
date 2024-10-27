// middlewares/sanitizer.js
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizer = {
  // Sanitize request body
  sanitizeBody: (req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = DOMPurify.sanitize(req.body[key].trim());
        }
      });
    }
    next();