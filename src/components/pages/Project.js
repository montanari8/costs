import styles from './Project.module.css'
import {useParams} from 'react-router-dom'
import {useState, useEffect} from 'react'
import Loading from '../layout/Loading'
import Container from '../layout/Container'
import ProjectForm from '../project/ProjectForm'
import Message from '../layout/Message'
import ServiceForm from '../service/ServiceForm'
import { parse, v4 as uuidv4 } from 'uuid'
import ServiceCard from '../service/ServiceCard'



function Project(){

    //Pega a ID do projeto
    const { id } = useParams()
    //console.log(id)

    //Estado Mostrar Projeto
    const [showProjectForm, setShowProjectForm] = useState(false)


    //Carrega o Projeto na variável state project
    const [project, setProject] = useState([])

    //Loading
    const [removeLoading, setRemoveLoading] = useState(false)

    //Estado e Tipo das Mensagens
    const [message, setMessage] = useState()
    const [type, setType] = useState()

    //Estado do Formulário de Serviço
    const [showServiceForm, setShowServiceForm] = useState(false)

    //Inserir estado de novo serviço
    const [services, setServices] = useState([])


    //Fazer o carregamento síncrono para carregar o project
    useEffect(() => {
        fetch(`http://localhost:5000/projects/${id}`,{
            method: 'GET',
            headers: {
                'Content-Type':'application/json'
            }
        }).then(

            resp => resp.json()


        ).then(

            (data) => {

                setProject(data) // Seta o projeto na variável state
                setRemoveLoading(true) // seta para tirar o estado false do Loading
                setServices(data.services) // Seta os serviços do projeto

            }

        ).catch(

            err => console.log(err)

        )
    },[id])

    //Função para botão mostrar projeto
    function toggleProjectForm() {
        setShowProjectForm(!showProjectForm)
      }

    //Função para botão mostrar Serviços
    function toggleServiceForm() {
        setShowServiceForm(!showServiceForm)
    }

    //Editar Projeto
    function editPost(project){
        setMessage('')
        //Regra de Negócio (geralmente teria que ir para API)
        // Verifica se não passou do valor do projeto
        if(project.budget < project.coust || project.budget < 0){
            //mensagem
            setMessage('O orçamento não pode ser menor que o custo do projeto!')
            setType('error')
            return false
        }

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                        'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        })
        .then((resp) => resp.json())
        .then((data) => {
            setProject(data)
            setShowProjectForm(!showProjectForm)
            setMessage('Projeto atualizado!')
            setType('success')
        }).catch(

            err => console.log(err)

        )




    }

    function createService(project) {
        // last service
        const lastService = project.services[project.services.length - 1]
    
        lastService.id = uuidv4()
    
        const lastServiceCost = lastService.cost
    
        const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost)
    
        // maximum value validation
        if (newCost > parseFloat(project.budget)) {
          setMessage('Orçamento ultrapassado, verifique o valor do serviço!')
          setType('error')
          project.services.pop()
          return false
        }
    
        // add service cost to project cost total
        project.cost = newCost

        // FECHAR O FORM DE SERVIÇO
        setShowServiceForm(!showServiceForm)
    
        fetch(`http://localhost:5000/projects/${project.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        })
          .then((resp) => resp.json())
          .then((data) => {
            setServices(data.services)
            
            setMessage('Serviço adicionado!')
            setType('success')
          })
      }

      function removeService(id, cost) {
        const servicesUpdated = project.services.filter(
          (service) => service.id !== id,
        )
    
        const projectUpdated = project
    
        projectUpdated.services = servicesUpdated
        projectUpdated.cost = parseFloat(projectUpdated.cost) - parseFloat(cost)
    
        fetch(`http://localhost:5000/projects/${projectUpdated.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectUpdated),
        })
          .then((resp) => resp.json())
          .then((data) => {
            setProject(projectUpdated)
            setServices(servicesUpdated)
            setMessage('Serviço removido com sucesso!')
          })
      }
    


    return( 
        <>        

           {project.name ? (

            <div className={styles.project_details}>

                <Container customClass="column">

                    {message && <Message type={type} msg={message} />}

                    <div className={styles.details_container}>
                        <h1>Projeto: {project.name}</h1>
                        <button className={styles.btn} onClick={toggleProjectForm}>
                            {!showProjectForm ? 'Editar Projeto' : 'Fechar'}
                        </button>
                        {!showProjectForm ? (
                            <div className={styles.form}>
                                <p><span>Categoria:</span> {project.category.name}</p>
                                <p><span>Total Orçamento:</span> {project.budget}</p>
                                <p><span>Total Utilizado:</span> {project.cost}</p>

                                


                            </div>
                        ):(
                            <div className={styles.form}>

                            <ProjectForm
                                handleSubmit={editPost}
                                btnText="Concluir Edição"
                                projectData={project}
                            />

                            </div>
                        )}

                    </div>
                    <div className={styles.service_form_container}>
                        <h2>Adicione um serviço:</h2>
                        <button className={styles.btn} onClick={toggleServiceForm}>
                            {!showServiceForm ? 'Adicionar Serviço' : 'Fechar'}
                        </button>
                        <div className={styles.form}>
                            {showServiceForm && (
                                <ServiceForm
                                    handleSubmit={createService}
                                    btnText="Adicionar Serviço"
                                    projectData={project}
                                />
                            )}
                        </div>

                    </div>
                    <h2>Serviços</h2>
                    <Container customClass="start">
                        {
                            services.length > 0 &&
                            services.map( (service) => (
                                <ServiceCard
                                    id={service.id}
                                    name={service.name}
                                    cost={service.cost}
                                    description={service.description}
                                    key={service.id}
                                    handleRemove={removeService}
                                />
                            ))

                        }

                        {services.length === 0 && <p>Não há serviços cadastrados. </p>}
                    </Container>
                </Container>
           </div>




           ):(
           < Loading />)}

        </>
    )
}

export default Project