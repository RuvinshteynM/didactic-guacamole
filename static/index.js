var page = "categories"; //which display is currently being shown (categories, videos, info)
var category = null; //which category is being shown -- set to null unless showing a category
var video = null; //which video is being shown by id -- set to null unless showing a video

//master array of all videos
var videos = [];
d3.csv("../static/USvideos.csv", 
       function(data) {
    for (var x = 0; x < data.length; x++)
    {
        if (idExists(data[x]['video_id'])){}
        else
        {
            videos.push(data[x]);
        }
    }
    document.getElementById("loader").outerHTML = '';
    console.log(videos);
    console.log(videos.length);
});


var idExists = function(id){
    for (var x = 0; x < videos.length; x++){
        if (videos[x]['video_id'] == id){
            return true;
        }
    }
    return false;
}

var svg = d3.select("svg")["_groups"][0][0];

var displayMenu = function(){
    var sv = d3.select("svg"),
        diameter = +sv.attr("width"),
        g = sv.append("g").attr("transform", "translate(2,2)"),
        format = d3.format(",d");

    var pack = d3.pack()
    .size([diameter - 4, diameter - 4]);

    d3.json("static/data.json", function(error, root) {
        if (error) throw error;

        root = d3.hierarchy(root)
            .sum(function(d) { return d.size; })
            .sort(function(a, b) { return b.value - a.value; });

        var node = g.selectAll(".node")
        .data(pack(root).descendants())
        .enter().append("g")
        .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .on("click",function(e){
            var newCategory = e['data']['name'];
            changeCategory(newCategory);
            d3.json("static/data.json", function(error, d){
                if (error) throw error;
                for (var c = 0; c < d['children'].length; c++){
                    //console.log(d['children'][c]['name']);
                    //console.log(newCategory == d['children'][c]['name']);
                    if (newCategory == d['children'][c]['name']){
                        console.log(searchByCategory(d['children'][c]['id']));
                    }
                }
            })
            page = "videos";
            display();
        });

        node.append("title")
            .text(function(d) { return d.data.name + "\n" + format(d.value) + " videos"; });

        node.append("circle")
            .attr("r", function(d) { return d.r; });

        node.filter(function(d) { return !d.children; }).append("text")
            .attr("dy", "0.3em")
            .text(function(d) { return d.data.name.substring(0, d.r / 3); });
    });
}

//change the category variable based on the input -- activated by clicking on circles
var changeCategory = function(e){
    category = e;
}

//return an array of videos based on their category
var searchByCategory = function(e){
    var arr = [];
    for (var x = 0; x < videos.length; x++){
        if (videos[x]["category_id"] == e){
            arr.push(videos[x]);
        }
    }
    return arr;
}

var displayCategory = function(){
}

var displayVideo = function(){

}

//displays different page based on page variable
var display = function(){
    svg.innerHTML = "";
    if (page == "categories"){
        displayMenu();
    }
    if (page == "videos"){
        displayCategory();
    }
    if (page == "info"){
        displayVideo();
    }
}

display();

var diyList = {
    listerine: function(itemID,data){
        itemID = '#'+itemID;
        var sortAscending = true;
        var table = d3.select(itemID).append('table');
        var titles = d3.keys(data[0]);
        var headers = table.append('thead').append('tr')
        .selectAll('th')
        .data(titles).enter()
        .append('th')
        .text(function(d) {
            return d
        })
        .on('click', function(d) {
            headers.attr('class', 'header');
            if (d == "title" || d == "channel_title" || d == "Other") { //these keys sort alphabetically
                // sorting alphabetically");
                if (sortAscending) {
                    rows.sort(function(a, b) {
                        return d3.ascending(a[d], b[d]);
                    });
                    sortAscending = false;
                    this.className = 'aes';
                } else {
                    rows.sort(function(a, b) {
                        return d3.descending(a[d], b[d]);
                    });
                    sortAscending = true;
                    this.className = 'des';
                }
            } else {
                if (sortAscending) {
                    //all other keys sort numerically including time
                    rows.sort(function(a, b) {
                        return b[d] - a[d];
                    });
                    sortAscending = false;
                    this.className = 'aes';
                } else {
                    rows.sort(function(a, b) {
                        return a[d] - b[d];
                    });
                    sortAscending = true;
                    this.className = 'des';
                }
            }
        });

        var rows = table.append('tbody').selectAll('tr')
        .data(data).enter()
        .append('tr');
        rows.selectAll('td')
            .data(function(d) {
            return titles.map(function(key, i) {
                return {
                    'value': d[key],
                    'name': d
                };
            });
        }).enter()
            .append('td')
            .attr('data-th', function(d) {
            return d.name;
        })
            .text(function(d) {
            //BRING BACK IF YOU EVER NEED DEBUGGING
            //console.log("typeof(" + d.value + "): " + typeof(d.value));

            if (typeof(d.value) == "object") {
                console.log("Yippee it's an object");
                return timeformat(d.value)
            } else {
                return d.value
            }
        });

    }
};
