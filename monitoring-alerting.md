# Monitoring / Alerting

## Integrated Monitoring

For product team to be able to monitor all queues within our echo system we need a proper monitoring solution that can provide support for defining different monitoring on different queues with different alerting mechanism. It has to support monitoring to the granular level of specific sever queue types that can not tolerate failures and provide the proper escalation method required.

### ~~NewRelic~~

From monitoring on the client connecting to the queue NewRelic seems to cover well that part which should be good enough given the usage of new relic in most apps we have now.

On the other hand on monitoring the actual RabbitMQ cluster it provides a very simple plugin that doesn't support any of the options we mentioned to go to granular level of queues to support the team rather on a high level of monitoring basic OS level health metrics \(cpu, memory\).

### DataDog

After the failure encountered in NewRelic we explored DataDog solution and it comes with a variety of options that makes supporting the MQ cluster & queues possible.

#### 1- DataDog Monitoring

support for monitoring is really good with the ability to create dashboards to monitor overall errors in the cluster, message rates, queue depth, many other metrics that flows from RabbitMQ to DataDog. Take a look at the dashboard below.

[https://p.datadoghq.com/sb/011fa5934-2041f4fb37e4f0794cdac38637691e95](https://p.datadoghq.com/sb/011fa5934-2041f4fb37e4f0794cdac38637691e95)

![DataDog Monitoring RabbitMQ](.gitbook/assets/image%20%289%29.png)

Dashboard covers 2 queues implemented in that solution. Breakdown of each graph is below.

* Graph covering overall messages/errors in the system.

![](.gitbook/assets/image%20%282%29.png)

* Graph covering each queue message rate over time.

![](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LAk21gR8m4OLD0g0ox5%2F-LAkEql6XwnRxcCGe9Yk%2F-LAkHBG3wxmx4pbBMXkp%2Fimage.png?alt=media&token=177a6bcb-7bd2-4dba-94a7-c6c8ab0f4865)  


* Graph covering each queue depth with color codes set with thresholds.

![](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LAk21gR8m4OLD0g0ox5%2F-LAkEql6XwnRxcCGe9Yk%2F-LAkHTSv59AUKx2ZIyRH%2Fimage.png?alt=media&token=074c01b6-0ea2-4a0d-acf4-a6c9653e09c8)  


#### 2- DataDog Alerting

DataDog provides integration with multiple solutions for alerting \(Email, Slack, OpsGenie, ...\) but taking the basic email alerting it's really good in configuring alerting for granular level queues just like the graphs. Below are 2 email examples setup for error queues with threshold 0 to become red while the other queues have **&gt;= 20** yellow &** &gt;= 40** Red

![](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LAk21gR8m4OLD0g0ox5%2F-LAkIX3G13qxgg8msXUu%2F-LAkJkCHZ0WEFDj0OJG5%2Fimage.png?alt=media&token=25f85cd9-15a2-43d8-9a79-54cd5dff8e7f)  


