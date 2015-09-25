process.env.NODE_ENV = 'test'

var cfg = require('../config/');
var container = require('../');
var chai = require('chai')
    , expect = chai.expect
    , should = chai.should()
    , assert = chai.assert;

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


describe('List Container', function () {

    describe("getListContainer", function() {


        var callback = function (err, blobs, continuationToken){
            // TODO por que no es invocada?
            var result = null;
            if (err) {
                console.error("Couldn't list blobs");
                console.error(err);
                result = { isSuccessful: false, error: err };
            } else {
                result = { isSuccessful: true, entries: blobs, continuationToken: continuationToken };
            }
            console.log('before every test in every file');
            return;
        };


        it("should get list 15 blobs from container: " + cfg.storage.container, function(callback){
           // this.timeout(20000);
            var querySize =  25
                , nextMarker =  null
                , targetLocation =  0
                , prefix = '';
            var options = {maxResults:querySize};

            container.getContentFromContainer(cfg.storage.container,
                prefix,
                null,
                options,
                function (err, blobs, continuationToken){
                    should.not.exist(err);
                    should.not.exist(continuationToken);
                    expect(blobs).to.be.a('array');
                    expect(blobs).to.have.length(15);

                    callback(err, blobs, continuationToken);//Test Goes Here // TODO el llamado al callback no se hace
                });
        });
        var contToken=null;
        it("should get list 8 of blobs from container: " + cfg.storage.container, function(callback){
            // this.timeout(20000);
            var querySize =  8
                , nextMarker =  null
                , targetLocation =  0
                , prefix = '';
            var options = {maxResults:querySize};

            container.getContentFromContainer(cfg.storage.container,prefix,
                null,
                options,
                function (err, blobs, continuationToken){
                    should.not.exist(err);
                    should.exist(continuationToken);
                    expect(blobs).to.be.a('array');
                    expect(blobs).to.have.length(8);
                    contToken = continuationToken;

                    callback(err, blobs, continuationToken);//Test Goes Here // TODO el llamado al callback no se hace

                });
        });

        it("should get list 7 of blobs from container: " + cfg.storage.container, function(callback){
            // this.timeout(20000);
            var querySize =  8
                , nextMarker =  null
                , targetLocation =  0
                , prefix = '';
            var options = {maxResults:querySize};

            container.getContentFromContainer(cfg.storage.container,prefix,
                contToken,
                options,
                function (err, blobs, continuationToken){
                    should.not.exist(err);
                    should.not.exist(continuationToken);
                    expect(blobs).to.be.a('array');
                    expect(blobs).to.have.length(7);
                    callback(err, blobs, continuationToken);//Test Goes Here // TODO el llamado al callback no se hace

                });
        });

        it("should get list with prefix of blobs from container: " + cfg.storage.container, function(callback){
            // this.timeout(20000);
            var querySize =  25
                , nextMarker =  null
                , targetLocation =  0
                , prefix = 'filename--';

            var options = { maxResults:querySize};

            container.getContentFromContainer(cfg.storage.container,
                prefix,
                null,
                options,
                function (err, blobs, continuationToken){

                    should.not.exist(err);
                    should.not.exist(continuationToken);
                    expect(blobs).to.be.a('array');
                    expect(blobs).to.have.length(9);

                    callback(err, blobs, continuationToken);//Test Goes Here // TODO el llamado al callback no se hace
                });
        });
    });
});
