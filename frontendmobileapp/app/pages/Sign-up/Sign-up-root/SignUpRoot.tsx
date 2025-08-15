import { useAppSelector } from '../../../store/hooks';
import Page1 from '../Page-1/Page1';
import Page2 from '../Page-2/Page2';
import Page3 from '../Page-3/Page3';


const SignUpScreen = () => {
  const pageNumber = useAppSelector((state) => state.auth.SignupPageNo );

  return (
    <>
      {pageNumber == 1 && (
       <Page1></Page1> 
      )}

      {pageNumber == 2 && (
       <Page2></Page2> 
      )}

      {pageNumber == 3 && (
       <Page3></Page3> 
      )}
    </>
       
  );
};

export default SignUpScreen;