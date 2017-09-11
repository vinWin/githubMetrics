function getProfile(){
    var name = $('#name').val();
    if(name != '') {
        var url = '/githubPayload?name='+name;
        $('#table').show();
       $.get(url, function (response) {
            $('#table').bootstrapTable('load',response);
        });
    }
 }
