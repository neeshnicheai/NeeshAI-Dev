# Claude Code Instructions - Production Environment

## 🚨 **PRODUCTION ENVIRONMENT - CRITICAL SAFETY PROTOCOLS**

You are working in the **NeeshAI Production Repository**. This is a **LIVE PRODUCTION SYSTEM** serving real users.

### **⚠️ STRICT SAFETY RULES ⚠️**
- 🔒 **NO EXPERIMENTAL CHANGES** - Only thoroughly tested, stable code
- 🔒 **NO DIRECT DATABASE MODIFICATIONS** - Use migration scripts only
- 🔒 **NO API KEY COMMITS** - Production keys must remain secure
- 🔒 **ROLLBACK READY** - Always have a rollback plan before changes
- 🔒 **MONITORING MANDATORY** - Watch metrics during and after deployments

## 🏭 **Production Architecture**

### **Live Production Components**
- **Spring Boot Backend** (Port 8081): Production API serving real users
- **Node.js AI Service** (Port 3000): Production RAG pipeline
- **Supabase Production Instance**: Live customer data and embeddings
- **Production Database**: Contains real user data - handle with extreme care

### **Production Infrastructure**
- **Load Balancer**: Nginx reverse proxy
- **Monitoring**: Prometheus + Grafana + AlertManager
- **Logging**: Centralized logging with correlation IDs
- **Backup**: Automated daily backups with point-in-time recovery

## 🛡️ **Security Requirements**

### **Production Security Protocols**
- ✅ **Environment isolation**: Separate from development
- ✅ **API key rotation**: Monthly rotation schedule
- ✅ **Access controls**: Limited production access
- ✅ **Audit logging**: All changes tracked
- ✅ **Vulnerability scanning**: Regular security scans

### **Compliance Requirements**
- **Data Protection**: Customer data must be handled per privacy policy
- **Encryption**: All data encrypted in transit and at rest
- **Access Logs**: Maintain audit trail for compliance
- **Backup Retention**: 30-day backup retention policy

## 🚀 **Production Deployment Protocols**

### **Pre-Deployment Checklist** (MANDATORY)
- [ ] **Code reviewed** by senior developer
- [ ] **Security scan passed** (no critical vulnerabilities)
- [ ] **Load testing completed** (performance validated)
- [ ] **Database migration tested** on staging replica
- [ ] **Rollback plan documented** and tested
- [ ] **Monitoring alerts configured** for new features
- [ ] **Backup verification** completed
- [ ] **Stakeholder approval** obtained

### **Deployment Windows**
- **Scheduled Maintenance**: Tuesdays/Thursdays 2-4 AM UTC
- **Emergency Hotfixes**: Any time (with proper approval)
- **Feature Releases**: Monthly on first Tuesday
- **Database Changes**: Quarterly during planned downtime

## 📊 **Production Monitoring**

### **Critical Metrics (Monitor During Changes)**
- **Response Time**: <2 seconds (95th percentile)
- **Error Rate**: <0.1% (critical errors)
- **RAG Quality**: >0.7 overall score
- **Cache Hit Rate**: >80%
- **Database Connections**: <40 active connections
- **Memory Usage**: <80% of allocated

### **Alert Thresholds**
- **Response time >5 seconds**: Immediate alert
- **Error rate >1%**: Critical alert
- **Database connections >45**: Warning alert
- **Memory usage >90%**: Critical alert
- **Disk space >85%**: Warning alert

## 🔍 **Production Operations**

### **Safe Change Procedures**

#### **1. Configuration Changes**
```bash
# Always backup current config
cp application.properties application.properties.backup.$(date +%Y%m%d_%H%M%S)

# Apply changes gradually
# Test in staging first
# Monitor metrics after each change
```

#### **2. Database Changes**
```bash
# Create backup before migration
pg_dump production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Test migration on staging replica
# Apply during maintenance window
# Verify data integrity after migration
```

#### **3. Code Deployments**
```bash
# Blue-green deployment strategy
# Deploy to inactive environment first
# Run health checks
# Switch traffic gradually
# Monitor for 30 minutes minimum
```

### **Emergency Procedures**

#### **Rollback Process**
1. **Identify issue severity** (P0: immediate rollback, P1: fix forward)
2. **Execute rollback plan** (documented before deployment)
3. **Verify system stability** (all metrics green)
4. **Notify stakeholders** (incident communication)
5. **Post-incident review** (root cause analysis)

#### **Incident Response**
1. **Acknowledge alert** within 5 minutes
2. **Assess impact** and classify severity
3. **Implement immediate mitigation**
4. **Escalate if needed** (contact on-call engineer)
5. **Document actions taken**

## 🎯 **Performance Optimization**

### **Production Performance Targets**
- **API Response Time**: <500ms average, <2s 95th percentile
- **RAG Pipeline**: <3s end-to-end for complex queries
- **Database Queries**: <100ms for simple queries, <500ms for complex
- **Memory Usage**: <70% of allocated resources
- **CPU Usage**: <60% average, <80% peak

### **Optimization Guidelines**
- **Cache Strategy**: Aggressive caching for read operations
- **Connection Pooling**: Optimal pool size based on load patterns
- **Query Optimization**: Regular query performance analysis
- **Resource Allocation**: Monitor and adjust based on usage patterns

## 🔒 **Security Operations**

### **Regular Security Tasks**
- **Weekly**: Vulnerability scan review
- **Monthly**: API key rotation
- **Quarterly**: Security audit and penetration testing
- **Annually**: Compliance certification renewal

### **Security Incident Response**
1. **Isolate affected systems** immediately
2. **Assess data exposure** and impact
3. **Notify security team** within 15 minutes
4. **Document incident** with timeline
5. **Implement fixes** and preventive measures

## 🔧 **Maintenance Operations**

### **Routine Maintenance Checklist**
- [ ] **Health Check Validation**: All endpoints responding
- [ ] **Database Optimization**: Index maintenance and statistics update
- [ ] **Log Rotation**: Archive old logs, maintain storage limits
- [ ] **Backup Verification**: Test backup restoration process
- [ ] **Certificate Renewal**: Check SSL certificate expiration
- [ ] **Dependency Updates**: Security patches only (test thoroughly)

### **Monthly Tasks**
- [ ] **Performance Review**: Analyze metrics and identify trends
- [ ] **Capacity Planning**: Project resource needs for next quarter
- [ ] **Security Review**: Update security configurations
- [ ] **Disaster Recovery Test**: Validate backup and recovery procedures

## 📈 **Business Continuity**

### **High Availability Setup**
- **Load Balancing**: Multi-zone deployment
- **Database Clustering**: Primary-replica configuration
- **Failover Automation**: Automatic failover for database
- **Geographic Distribution**: Multi-region backup strategy

### **Disaster Recovery**
- **RTO (Recovery Time Objective)**: 4 hours maximum
- **RPO (Recovery Point Objective)**: 15 minutes maximum
- **Backup Strategy**: Continuous replication + daily snapshots
- **Testing Schedule**: Monthly DR drills

## 📋 **Change Management**

### **Change Categories**
1. **Emergency Hotfix**: Critical security or availability issue
2. **Standard Change**: Scheduled feature release or bug fix
3. **Normal Change**: Configuration or minor update
4. **Major Change**: Architectural or significant feature change

### **Approval Process**
- **Emergency**: CTO approval + immediate notification
- **Standard**: Technical lead + product owner approval
- **Normal**: Peer review + automated testing
- **Major**: Architecture review board approval

## 🆘 **Production Support**

### **On-Call Responsibilities**
- **Response Time**: <15 minutes for P0, <1 hour for P1
- **Escalation Path**: Engineer → Senior → Lead → Management
- **Communication**: Update stakeholders every 30 minutes during incidents
- **Documentation**: Detailed incident reports within 24 hours

### **Support Tools**
- **Monitoring Dashboard**: https://monitoring.neeshai.com
- **Log Aggregation**: Centralized logging system
- **Alert Manager**: PagerDuty integration
- **Status Page**: https://status.neeshai.com

## 🔍 **Quality Assurance**

### **Production Testing**
- **Smoke Tests**: Run after every deployment
- **Health Checks**: Automated every 5 minutes
- **Performance Tests**: Weekly load testing
- **Security Scans**: Daily vulnerability scanning

### **Quality Gates**
- **Code Coverage**: >80% for new code
- **Performance**: No regression in key metrics
- **Security**: No high-severity vulnerabilities
- **Availability**: 99.9% uptime SLA compliance

---

## 🚨 **EMERGENCY CONTACTS**

### **Escalation Chain**
1. **On-Call Engineer**: +1-XXX-XXX-XXXX
2. **Technical Lead**: +1-XXX-XXX-XXXX
3. **CTO**: +1-XXX-XXX-XXXX
4. **CEO**: +1-XXX-XXX-XXXX (P0 incidents only)

### **Critical URLs**
- **Production API**: https://api.neeshai.com
- **Admin Dashboard**: https://admin.neeshai.com
- **Monitoring**: https://monitoring.neeshai.com
- **Status Page**: https://status.neeshai.com

### **Emergency Procedures**
- **Database Issues**: Contact DBA immediately
- **Security Breach**: Isolate + notify security team
- **Data Loss**: Immediate escalation to CTO
- **Service Outage**: Follow incident response playbook

---

**⚠️ REMEMBER: You are working with LIVE PRODUCTION DATA serving real customers. Every action must be deliberate, tested, and reversible. When in doubt, escalate to senior team members. Customer trust and data safety are paramount.**