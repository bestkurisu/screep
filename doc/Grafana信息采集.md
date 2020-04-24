## Grafana信息采集

### 采集方法
在'main'中运行'stateScanner'函数进行全局检测，并定期存到'Memory.state'中。
房间中的信息由对应的建筑定期上传到'Memory.rooms'中，以供'stateScanner'采集。
'setting'中创建'stateScanInterval'参数来管理扫描间隔。

### 统计信息
##### 全局
- CPU使用情况
- bucket存量
- GCL进度和等级
- GPL进度和等级

##### 房间
- RCL进度和等级
- Storage里的能量和power
- Nuker情况
