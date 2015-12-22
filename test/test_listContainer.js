process.env.NODE_ENV = 'test';

var cfg = require('./config/');
var container = require('../');
var chai = require('chai');
var expect = chai.expect;

/*
 container: test
 NAME URL LAST MODIFIED SIZE
 filename--1.txt https://mamuttest.blob.core.windows.net/test/filename--1.txt 9/21/2015 3:10:19 PM  0 B
 filename--2.txt https://mamuttest.blob.core.windows.net/test/filename--2.txt 9/21/2015 3:10:39 PM  0 B
 filename--3.txt https://mamuttest.blob.core.windows.net/test/filename--3.txt 9/21/2015 3:10:55 PM  0 B
 filename--4.txt https://mamuttest.blob.core.windows.net/test/filename--4.txt 9/21/2015 3:11:23 PM  0 B
 filename--5.txt https://mamuttest.blob.core.windows.net/test/filename--5.txt 9/21/2015 3:11:38 PM  0 B
 filename--6.txt https://mamuttest.blob.core.windows.net/test/filename--6.txt 9/21/2015 3:11:57 PM  0 B
 filename--7.txt https://mamuttest.blob.core.windows.net/test/filename--7.txt 9/21/2015 3:12:23 PM  0 B
 filename--8.txt https://mamuttest.blob.core.windows.net/test/filename--8.txt 9/21/2015 3:12:37 PM  0 B
 filename--9.txt https://mamuttest.blob.core.windows.net/test/filename--9.txt 9/21/2015 3:12:54 PM  0 B
 filename1.txt https://mamuttest.blob.core.windows.net/test/filename1.txt 9/21/2015 3:05:46 PM  0 B
 filename2.txt https://mamuttest.blob.core.windows.net/test/filename2.txt 9/21/2015 3:06:07 PM  0 B
 filename3.txt https://mamuttest.blob.core.windows.net/test/filename3.txt 9/21/2015 3:06:26 PM  0 B
 filename4.txt https://mamuttest.blob.core.windows.net/test/filename4.txt 9/21/2015 3:09:09 PM  0 B
 filename5.txt https://mamuttest.blob.core.windows.net/test/filename5.txt 9/21/2015 3:09:36 PM  0 B
 filename6.txt https://mamuttest.blob.core.windows.net/test/filename6.txt 9/21/2015 3:09:49 PM
**/


describe.skip('List Container', function() {

    describe("getListContainer (" + cfg.storage.container + ")", function() {

        it("should get list 15 blobs from container", function(done) {
         // this.timeout(20000);
          var querySize = 25;
          var options = {
            storage: cfg.storage,
            maxResults: querySize
          };

          container.getContentFromContainer(options)
          .then(function(result) {
            expect(result.continuationToken).to.not.exist;
            expect(result.blobs).to.be.a('array');
            expect(result.blobs).to.have.length(15);
            done();
          })
          .catch(done);
        });

        it("should get list 8 of blobs from container", function(done) {
          // this.timeout(20000);
          var querySize = 8;
          var options = {
            storage: cfg.storage,
            maxResults: querySize
          };

          container.getContentFromContainer(options)
          .then(function(result) {
            expect(result.continuationToken).to.exist;
            expect(result.blobs).to.be.a('array');
            expect(result.blobs).to.have.length(querySize);
            done();
          })
          .catch(done);
        });

        it("should get list 7 of blobs from container", function(done) {
          // this.timeout(20000);
          var querySize = 8;
          var options = {
            storage: cfg.storage,
            maxResults: querySize
          };

          container.getContentFromContainer(options)
          .then(function(result) {
            expect(result.continuationToken).to.not.exist;
            expect(result.blobs).to.be.a('array');
            expect(result.blobs).to.have.length(7);
            done();
          })
          .catch(done);
        });

        it("should get list with prefix of blobs from container", function(done) {
          // this.timeout(20000);
          var querySize =  25;
          var options = {
            prefix: 'filename--',
            storage: cfg.storage,
            maxResults: querySize
          };

          container.getContentFromContainer(options)
          .then(function(result) {
            expect(result.continuationToken).to.not.exist;
            expect(result.blobs).to.be.a('array');
            expect(result.blobs).to.have.length(9);
            done();
          })
          .catch(done);
        });
    });
});
