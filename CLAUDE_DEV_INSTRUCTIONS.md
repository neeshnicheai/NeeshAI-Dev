# Claude Code Instructions - Development Environment

## 🔧 **Development Environment Context**

You are working in the **NeeshAI Development Repository**. This environment is for:
- ✅ Active development and feature implementation
- ✅ Testing new RAG pipeline improvements
- ✅ Debugging and performance optimization
- ✅ CI/CD pipeline development
- ⚠️ **NOT for production deployments**

## 🏗️ **System Architecture**

### **Core Components**
- **Spring Boot Backend** (Port 8081): REST API, auth, document management
- **Node.js AI Service** (Port 3000): RAG pipeline, embeddings, chat processing
- **Supabase Development Instance**: PostgreSQL with pgvector
- **Development Database**: Separate from production

### **RAG Pipeline Features**
- Semantic reranking with cosine similarity
- Multi-layer caching (response, retrieval, embedding)
- RAG Triad evaluation metrics (context relevance, faithfulness, answer relevance)
- Query expansion with LLM paraphrasing
- Hybrid search (vector + keyword)

## 🛠️ **Development Guidelines**

### **Environment Setup Commands**
```bash
# Copy environment templates
cp .env.example .env
cp ai-service/.env.example ai-service/.env

# Start AI Service
cd ai-service && npm install && npm run build && npm start

# Start Spring Boot Backend
mvn clean install && mvn spring-boot:run
```

### **Key Development Files**
- `src/main/resources/application.properties` - Spring Boot configuration
- `ai-service/src/services/ChatService.ts` - Main RAG pipeline
- `ai-service/src/services/EvaluationService.ts` - RAG quality metrics
- `ai-service/src/services/CacheService.ts` - Multi-layer caching
- `.env` files - Environment configuration (NEVER commit these)

## 🔍 **When Working on Features**

### **RAG Pipeline Development**
When modifying RAG components:
1. **Test locally** before committing
2. **Check cache performance** using `/internal/rag-analytics/cache`
3. **Monitor evaluation metrics** via `/internal/rag-analytics/global`
4. **Validate with multiple query types** (short, long, technical, conversational)

### **API Development**
When adding new endpoints:
1. **Add to ChatController or RagController**
2. **Include proper error handling** with correlation IDs
3. **Add Swagger documentation** with @Operation annotations
4. **Test with Postman** or curl commands

### **Database Changes**
When modifying schema:
1. **Create migration scripts** in `supabase/migrations/`
2. **Test on development database** first
3. **Document schema changes** in commit messages
4. **Verify vector operations** still work with pgvector

## 🧪 **Testing Strategy**

### **Local Testing Checklist**
- [ ] RAG pipeline responds correctly
- [ ] Caching reduces API calls (check logs)
- [ ] Evaluation metrics are reasonable (>0.6 overall score)
- [ ] Error handling works for invalid queries
- [ ] Memory usage is stable during load

### **API Testing**
```bash
# Health checks
curl http://localhost:8081/actuator/health
curl http://localhost:3000/internal/rag-analytics/cache

# RAG testing
curl -X POST http://localhost:3000/internal/chat \
  -H "Authorization: Bearer your_internal_api_key" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test", "query": "test question"}'
```

## ⚡ **Performance Optimization**

### **Caching Strategy**
- **Embedding Cache**: 1 hour TTL, reduces OpenAI API calls
- **Retrieval Cache**: 15 min TTL, speeds up similar queries
- **Response Cache**: 5 min TTL, handles exact duplicate queries

### **Database Optimization**
- **Connection Pooling**: HikariCP with 50 max connections
- **Vector Indexes**: HNSW indexes on embeddings for fast similarity search
- **Batch Operations**: 25 batch size for database inserts

## 🐛 **Debugging Guidelines**

### **Common Issues**
1. **Port conflicts**: Check `lsof -i :3000` and `lsof -i :8081`
2. **Database connection**: Verify Supabase credentials in .env
3. **API key issues**: Check OpenAI/Gemini keys are valid
4. **Memory leaks**: Monitor cache size and clear if needed

### **Useful Debugging Commands**
```bash
# Check running processes
lsof -i :3000 :8081

# View logs
tail -f ai-service/logs/app.log

# Test database connection
PGPASSWORD='password' psql -h host -U user -d database -c "SELECT 1"

# Clear cache manually
curl -X DELETE http://localhost:3000/internal/projects/PROJECT_ID/cache
```

## 🔒 **Security in Development**

### **Environment Security**
- **Never commit .env files** - use .env.example templates
- **Use development API keys** - separate from production
- **Rotate keys regularly** - especially if shared in team
- **Local HTTPS** - use for testing auth flows

### **Code Security**
- **Input validation** - validate all user inputs with @Valid
- **SQL injection prevention** - use parameterized queries
- **Rate limiting** - test with Bucket4j configurations
- **Authentication** - verify JWT tokens are properly validated

## 📊 **Monitoring and Analytics**

### **Development Metrics**
- **RAG Quality**: Monitor via `/internal/rag-analytics/global`
- **Cache Performance**: Check hit rates via `/internal/rag-analytics/cache`
- **Response Times**: Log pipeline performance in ChatService
- **Error Rates**: Monitor exception logs for patterns

### **Key Metrics to Track**
- Cache hit rate should be >70%
- RAG evaluation overall score should be >0.6
- Response time should be <2 seconds
- Error rate should be <5%

## 🚀 **Deployment to Staging**

### **Pre-deployment Checklist**
- [ ] All tests pass locally
- [ ] No console.log statements in production code
- [ ] Environment variables are properly configured
- [ ] Database migrations are tested
- [ ] API documentation is updated

### **Staging Environment**
- **URL**: https://staging-api.neeshai.com
- **Database**: Development Supabase instance
- **Monitoring**: Basic error tracking
- **Auto-deploy**: Triggered by merges to `develop` branch

## 💡 **Best Practices**

### **Code Quality**
1. **Follow TypeScript/Java conventions**
2. **Add meaningful comments** for complex RAG logic
3. **Use proper error handling** with try-catch blocks
4. **Log important events** but avoid excessive logging
5. **Keep functions focused** - single responsibility principle

### **Git Workflow**
1. **Create feature branches** from `develop`
2. **Write descriptive commit messages**
3. **Test thoroughly** before creating PR
4. **Request code reviews** for RAG pipeline changes
5. **Squash commits** before merging

---

## 🆘 **Need Help?**

### **Quick References**
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **Health Check**: http://localhost:8081/actuator/health
- **RAG Analytics**: http://localhost:3000/internal/rag-analytics/global
- **Cache Stats**: http://localhost:3000/internal/rag-analytics/cache

### **Common Tasks**
- **Add new RAG feature**: Modify `ChatService.ts` and test locally
- **Update database schema**: Create migration in `supabase/migrations/`
- **Fix performance issue**: Check cache hit rates and optimize queries
- **Debug API error**: Check logs and validate input parameters

**Remember**: This is the development environment - experiment freely, test thoroughly, and document changes!