class SearchFeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    search(){
        const keyword = this.queryString.keyword ? {
            name : {
                $regex: this.queryString.keyword,
                $options: 'i'
            },
        } : {};
        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy = { ...this.queryString };
        
         // Fields to remove for category filter
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key => delete queryCopy[key]);

         // Convert query to string for advanced filtering (e.g., range queries)
        let queryString = JSON.stringify(queryCopy);

        // Replace with MongoDB operators
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryString));
        return this;

    }

    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    pagination(resultPerPage){
            const currentPage = Number(this.queryString.page) || 1;
            const skip = resultPerPage * (currentPage - 1);
            this.query = this.query.limit(resultPerPage).skip(skip);
            return this;
    }


    // pagination(resultPerPage){
    //     const currentPage = Number(this.queryString.page) || 1;
    //     const skipProducts = resultPerPage * (currentPage - 1);

    //     this.query = this.query.limit(resultPerPage).skip(skipProducts);
    //     return this;
    // }
  
}

module.exports = SearchFeatures;