const chart1 = document.getElementById('chart1').getContext('2d');
                    const chart2 = document.getElementById('chart2').getContext('2d');
                    var chartData = new Array();

                    document.addEventListener('DOMContentLoaded', function(){
                        var http = new XMLHttpRequest();
                        http.open('GET', '/getChartData');
                        http.onreadystatechange = function(){
                            if(http.readyState==4 && http.status==200){
                                var response = http.responseText;
                                response = JSON.parse(response);
                                console.log(response);
                                if(response.status == 1){
                                    var data = response.data;
                                    fillChartData(data);
                                    console.log("OBJETO");
                                    console.log(chartData);

                                    var dates = new Array();
                                    var regists = new Array();
                                    var deads = new Array();
                                    for(object of chartData){
                                        dates.push(object.date);
                                        regists.push(object.regist);
                                        deads.push(object.dead);
                                    }

                                    var mychart = new Chart(chart1, {
                                        type: 'line',
                                        data: {
                                            labels: dates,
                                            datasets: [{
                                                label: 'Registrados',
                                                data: regists,
                                                backgroundColor: 'transparent',
                                                borderColor: 'blue'
                                            },
                                            {
                                                label: 'Muertes',
                                                data: deads,
                                                backgroundColor: 'transparent',
                                                borderColor: 'red'
                                            }]
                                        },
                                        options: {
                                            responsive: false
                                        }
                                    });

                                    //Llenar el PIE Data.
                                    var pieData = new Object;
                                    pieData.regist = 0;
                                    pieData.dead = 0;
                                    pieData.cured = 0;
                                    pieData.treatment = 0;
                                    pieData.uci = 0;

                                    for(var item of chartData){
                                        pieData.regist = Number(pieData.regist) + Number(item.regist);
                                        pieData.dead = Number(pieData.dead) + Number(item.dead);
                                        pieData.cured = Number(pieData.cured) + Number(item.cured);
                                        pieData.treatment = Number(pieData.treatment) + Number(item.treatment);
                                        pieData.uci = Number(pieData.uci) + Number(item.uci);
                                    }
                                    console.log("PIE DATA:");
                                    console.log(pieData);

                                    var array = [pieData.regist, pieData.deads, pieData.cured, pieData.treatment, pieData.uci];
                                    var pieChart = new Chart(chart2, {
                                        type: 'pie',
                                        data: {
                                            labels: ['Infectados', 'Muestes', 'Curados', 'Tratamiento', 'UCI'],
                                            datasets: [{
                                                label: 'PIE Chart',
                                                data: array,
                                                backgroundColor: ['blue', 'red', 'green', 'purple', 'orange']
                                            }]
                                        },
                                        options: {
                                            responsive: false
                                        }
                                    });
                                }else{
                                    alert(response.message);
                                }
                            }
                        }
                        http.send(null);
                    });

                    function num2state(num){
                        var state;
                        if(num == 0){
                            state = 'none';
                        }
                        if(num == 1){
                            state = 'negative';
                        }
                        if(num == 2){
                            state = 'treatment';
                        }
                        if(num == 3){
                            state = 'uci';
                        }
                        if(num == 4){
                            state = 'cured';
                        }
                        if(num == 5){
                            state = 'dead';
                        }
                        return state;
                    }

                    function fillChartData(data){
                        for(var item of data){
                            var found = false;
                            for(var object of chartData){
                                if(item[1] == object.date){
                                    var cont = object[num2state(item[0])];
                                    cont = Number(cont);
                                    cont++;
                                    object[num2state(item[0])] = cont;
                                    cont = Number(object.regist);
                                    cont++;
                                    object.regist = cont;
                                    found = true;
                                    break;
                                }
                            }
                            if(found == false){
                                var object = new Object();
                                object.date = item[1];
                                object.negative = (item[0]==1)?1:0;
                                object.treatment = (item[0]==2)?1:0;
                                object.uci = (item[0]==3)?1:0;
                                object.cured = (item[0]==4)?1:0;
                                object.dead = (item[0]==5)?1:0;
                                object.regist = (item[0] > 1)?1:0;

                                chartData.push(object);
                            }
                        }
                    }