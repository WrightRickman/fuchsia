'use strict';
var topics_application = {

  topics: [],

  fetch: function(success_fnc){
    var self = this;
    this.topics = [];

    $.ajax({
      url: '/topics', 
      dataType: 'json', 
      method: 'get'
    })
      .success(function(data){
        $(data).each(function(idx, topic_ele){
          var new_topic = new Topic(topic_ele.title, topic_ele.link, topic_ele.body, topic_ele.id);
          self.topics.push(new_topic)
        })
        success_fnc(); //call the function passed in
      }); 
  },

  render: function(){
    $('#topics-list').empty()
    // $('#completed-topics-list').empty()
    var topicsReversed = $(this.topics).sort(function(a,b){ return b["id"] - a["id"] });

    topicsReversed.each(function(idx, topic){   
      // if (topic.completed === false) {
        $('#topics-list').append(topic.renderCurrent());
      // } else {
        // $('#completed-topics-list').append(topic.renderCompleted());
      // }
    })  
  },

  bind_buttons: function(){
    $('.remove').on('click', function(e) {
      $(this).parent().data("topic").sync('destroy');
      $(this).parent().remove();
    });
  }

};

// *********************************************
//  Define Topic
function Topic(title, link, body, id){
  this.title = title;
  this.link = link;
  this.body = body;
  this.id = id;
}

// Local give-me-the-html-for-current-list
Topic.prototype.renderCurrent = function(){
  var new_div = $('<div>');
  new_div.append(this.title).append(this.link).append(this.body)
    .append($("<button>", {class: "remove"}).append("&#10007;"));
  new_div.data("topic", this);
  return new_div;
}

//  Local update
Topic.prototype.update = function(data){
  this.title = data.title
  this.link = data.link
  this.body = data.body
};

// Database mutation of destroy
Topic.prototype.destroy = function(){
  $.ajax({
    url: '/topics/' + this.id,
    dataType: 'json',
    method: 'delete'
  })
    .success(function(data){
      console.log('I got em.  Done... ')
    });
};



Topic.prototype.sync = function(method, topic_data){

  var self = this;

  var ajax_options;

  switch (method){
  case 'create':
    ajax_options = {
      url: '/topics',
      dataType: 'json',
      method: 'post',
      data: {topic: topic_data}
    }
    break;
  case 'get':
    ajax_options = {
      url: '/topics/' + this.id,
      dataType: 'json',
      method: 'get'
    }
    break;
  case 'update':
    ajax_options = {
      url: '/topics/' + this.id,
      dataType: 'json',
      method: 'put', 
      data: {topic: topic_data}
    }
    break;
  case 'destroy':
    ajax_options = {
      url: '/topics/' + this.id,
      dataType: 'json',
      method: 'delete' 
    } 
  }

  $.ajax(ajax_options)
    .success(function(data){
      self.update(data)
    })
};


$(function document_ready(){
  console.log('document is ready');

  var success_fnc = function(){
    topics_application.render()
    topics_application.bind_buttons()
  };

  topics_application.fetch(success_fnc);


  $('.add').on('click', function(e) {
    var new_topic_title = $('#input-title').val(); 
    var new_topic_link = $('#input-link').val(); 
    var new_topic_body = $('#input-body').val(); 
    if (new_topic_title.length > 0) {
      var new_topic = new Topic();
      new_topic.sync('create', {title: new_topic_title, link: new_topic_link, body: new_topic_body });
      topics_application.fetch(success_fnc);

    }

  });

});


