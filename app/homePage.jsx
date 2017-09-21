var React = require('react');
var ReactDOM = require('react-dom');
import { Provider, connect } from 'react-redux'
import { createStore } from 'redux'

function car(state = [], action) {
  switch (action.type) {
  case 'CAR_INFOS':
    {
      var data = {};
      if (action.params) {
        data = {"params":JSON.stringify(action.params)};
      }

      $.ajax({
         url: "/car_infos",
         dataType: 'json',
         type: 'GET',
         data: data,
         success: function(data) {
           if(data.success){
             store.dispatch({ type: 'GET_DATA', data: data.rows });
           }else {
             store.dispatch({ type: 'GET_DATA', data: [] });
           }
         },
         error: function(xhr, status, err) {
         }
      });

      return state;
    }
  case 'GET_DATA':
  {
    refreshCar(action.data);
    return action.data;
  }
  default:
    return state
  }
}

let store = createStore(car);

const mapStateToProps = (state) => {
    return {
        list: state
    }
}

class Wrap extends React.Component {
  constructor(props) {
      super(props);
      this.handleClick=this.handleClick.bind(this);
  }
  // 页面发生变化的时候触发
  componentDidMount() {
    $(function(){
      $("#scrollbar1").mCustomScrollbar({
        axis:"y",
        theme:"dark"
      });
    })

  }
  handleClick(e){
    var plate_number = $('#plate_number').val();
    var params = {'plate_number':plate_number};

    store.dispatch({ type: 'CAR_INFOS', params: params });
  }
  render() {
      return (
        <div className="car_wrap">
          <div className="title">
            车联网云平台
            <div className="input">
              <input type="text" id="plate_number" placeholder="输入车牌搜索"/>
              <button id="button" onClick={this.handleClick}>查找</button>
            </div>
          </div>
          <div className="wrap">
            <div id="container"></div>
            <div className="middle"></div>
            <div className="car_infor_list" id="scrollbar1">
              <Right />
            </div>
            <div className="middle"></div>
          </div>
        </div>
      );
  }
};

class RightClass extends React.Component {
  componentDidMount() {
    store.dispatch({ type: 'CAR_INFOS'});
  }

  render() {
    var infor;
    if (this.props.list.length==0) {
      infor = (<p className="red"><span >*未找到该车辆</span></p>);
    }else {
      infor = (<ul className="car_ul">
       {this.props.list.map((item,index) => (
         <LI item={item} key={index} list={this.props.list}/>
       ))}
     </ul>);
    }

      return (
        <div className="">
          {infor}
        </div>
      );
  }
};

class LI extends React.Component {
  constructor(props) {
      super(props);
      this.handleAddress=this.handleAddress.bind(this);
  }
  handleAddress(e){
    var gps_id = $(e.target).data("id");
    var list = this.props.list;
    for (var i = 0; i < list.length; i++) {
        if (list[i].gps_id==gps_id) {
            map.setCenter([location_map[gps_id].longitude,location_map[gps_id].latitude]);
        }
    }
  }
  render() {
      var clas='state'+this.props.item.state;
      return (
        <li className="gps">
          <div className="car_titile ">
            <div className={clas} onClick={this.handleAddress} data-id={ this.props.item.gps_id }><i className="fa fa-car car" data-id={ this.props.item.gps_id }></i>{this.props.item.code }</div>
            <div className="display">
              <span className="infor_span">车型：<e>{ this.props.item.car_brand }</e></span>
              <span className="infor_span">颜色：<e>{ this.props.item.color }</e></span>
              <span className="infor_span">车牌：<e>{ this.props.item.plate_number }</e></span>
              <span className="infor_span">状态：<e className="state">{ this.props.item.state_name }</e></span>
              <span className="infor_span">方向：<e>{ this.props.item.direction }°</e> </span>
              <span className="infor_span">速度：<e className="state">{ this.props.item.speed }km/h</e></span>
              <span className="infor_span"> 行驶：<e>{this.props.item.distance }km</e></span>
            </div>
            <span> 最新坐标：<e>[{this.props.item.longitude },{ this.props.item.latitude }]</e></span><br/>
            <span> 最新位置：<e>{ this.props.item.location }</e></span><br/>
            <span> 最后更新：<e>{ this.props.item.time }</e></span>
          </div>
        </li>
      );
  }
};

const Right = connect(mapStateToProps)(RightClass);

ReactDOM.render(
  <Provider store={store}>
      <Wrap/>
  </Provider>,
  document.getElementById("gps")
);
