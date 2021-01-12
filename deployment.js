const client = require('scp2')

console.log('开始发布测试环境....')

client.scp('tasks/dist/', 'root:fXmDDGpfV3ePnawmpYXjy@10.10.150.101:65522:/data/www/tasks/dist/', function(err) {
    err && console.log( err )
    console.log('js && css 发布测试环境成功')
})

client.scp('tasks/*.html', 'root:fXmDDGpfV3ePnawmpYXjy@10.10.150.101:65522:/data/www/tasks/', function(err) {
    err && console.log( err )
    console.log('html 发布测试环境成功')
})

