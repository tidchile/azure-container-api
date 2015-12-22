# azure-container-api

## Usage

```
npm install --save azure-container-api
```

```js
import container from 'azure-container-api';

const storage = {
  container: 'test',
  account: 'azure-account-name-here',
  accessKey: 'azure-storage-access-key-here',
};

var prefix = null; // path prefix

var nextMarker = null;
var targetLocation = 0;

var continuationToken = nextMarker ? {nextMarker: nextMarker, targetLocation: targetLocation} : null;

const options = {
  maxResults: 25,
  date: { year: 2013, month: 7, day: 27 },
};

container.getContentFromContainer(storage, prefix, continuationToken, options, function(err, blobs, continuationToken) {

  /*  blobs: array of entries:

    [
      {
        name: 'xxxx',
        properties: {
          'last-modified': 'Thu, 10 Sep 2015 21:03:26 GMT',
          'etag': '0x8D2BA2345B07FCF',
          'content-length': # bytes,
          'content-type': 'application/octet-stream',
          'content-encoding': ,
          'content-language': ,
          'content-md5': ,
          'cache-control': ,
          'content-disposition':,
          'blobtype': ,
          'leasestatus': ,
          'leasestate':
        }
      }
    ]


  */


});

```

See properties reference:
https://msdn.microsoft.com/en-us/library/azure/dd179394.aspx

## Options

### `date` (Optional)
