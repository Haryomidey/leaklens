# LeakLens Test Page

This folder contains a deliberately vulnerable static page for testing the LeakLens extension.

The credentials and tokens are fake demo values. They exist only to trigger scanner detections.

## Use

Open `vulnerable-page.html` in Chrome, then run LeakLens from the extension popup.

For the most realistic content-script behavior, serve this folder with any static file server and open the page through `http://localhost`.
