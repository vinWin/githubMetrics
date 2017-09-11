var express = require('express'),
    app = express(),
    port = process.env.PORT || 3001;
var request = require('request');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port);

var http = require("https");

var options = {
    uri: '',
    method: 'GET',
    headers: {'user-agent': 'node.js'},
    Access_token: '762351cb07164a4d50b1b6ecc093c6ea69e1dfcd'
};

var userInfo = {};
var repoInfo = {};
var gitObj = {};
var repos = [];

function getRepoCommitCount(repoName) {
    options['uri'] = 'https://api.github.com/repos/' + repoName + '/commits/master';
    console.log(repoName);
    console.log(options['uri']);
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            if (response && response.statusCode) {
                var r = JSON.parse(body);
                var obj = {};
                var totalCommits;

                for (key in r) {
                    if (Object.keys(userInfo).length === 0) {
                        userInfo.gitHandle = r['author']['login'];
                        userInfo.gitUrl = r['author']['html_url'];
                        userInfo.avatarUrl = r['author']['avatar_url'];
                        userInfo.email = r['commit']['author']['email'];
                        userInfo.reposUrl = r['author']['repos_url'];

                    }
                    // repo info
                    totalCommits = r['stats']['total'];
                    var temp = {repoName: repoName, commitCount: totalCommits};
                    repoInfo[repoName] = temp;
                }
                resolve({repoName: repoName, commitCount: totalCommits});
            }
        });
    });
}

function getgitObj(){
    Object.assign(gitObj, userInfo);
    var repos = [];
    for(key in repoInfo){
       repos.push(repoInfo[key]);
    }
    gitObj.repos = repos;
}

function getFollowersCount() {
    options['uri'] = 'https://api.github.com/users/' + gitObj['avatarUrl'] + '/followers';
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            if (response && response.statusCode) {
                var r = JSON.parse(body);
                userInfo['followersCount'] = r.length;
                resolve(true);
            }
        });
    });
}

function getPullRequestCount(repoName) {
    options['uri'] = 'https://api.github.com/repos/' + repoName + '/pulls';
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            if (response && response.statusCode) {
                var r = JSON.parse(body);
                var obj = repoInfo[repoName];
                obj.pRCount = r.length;
                repoInfo[repoName] = obj;
                resolve(true);
            }
        });
    });
}


function getRepos() {
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            if (response && response.statusCode) {
                var r = JSON.parse(body);
                for (var key in r) {
                    var count = 0;
                    if (count < 4) {
                        repos.push(r[key]['full_name']);
                        count++;
                    }
                }
                resolve(true);
            }
        });
    });
}


app.get('/githubPayload', function (req, res) {
    var name = req.query.name;
    options['uri'] = 'https://api.github.com/users/' + name + '/repos';
    getRepos()
        .then(function () {
            return Promise.all(repos.map(getRepoCommitCount));
        }).then(function () {
        return Promise.all(repos.map(getPullRequestCount));
        })
        .then(function () {
            return getFollowersCount();
        }).then(function () {
        getgitObj();
        res.send(gitObj.repos);
    })
        .catch(function (error) {
            console.log(error)
        })
});

console.log('RESTful API server started on: ' + port);




