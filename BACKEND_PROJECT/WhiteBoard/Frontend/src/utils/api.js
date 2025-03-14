
const URL='https://whiteboard-ftu8.onrender.com';
const token=localStorage.getItem('token');

export const updateCanvas=async(id,elements)=>{
    try{
       if(!token){
           throw new Error('Unauthorized');
        }
        const response=await fetch(`${URL}/canvas/update/${id}`,{
            method:'PUT',
            headers:{
                Authorization:`Bearer ${token}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify(elements)
        });
        const data=await response.json();
        if(!response.ok){
            throw new Error(data.message||'Failed to update canvas');
        }
        return data;
    }catch(error){
        throw error;
    }
}

export const fetchCanvas = async (id) => {
    try {
      const response = await fetch(`${URL}/canvas/load/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch canvas data");
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error fetching canvas:", error);
      throw error;
    }
};
